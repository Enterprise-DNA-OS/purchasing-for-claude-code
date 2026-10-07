CREATE FUNCTION touch_updated() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN NEW.updated_at=now(); RETURN NEW; END $$;
CREATE TABLE suppliers (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), name text NOT NULL UNIQUE CHECK(length(trim(name))>0),
 contact text NOT NULL DEFAULT '', evidence_ref text NOT NULL DEFAULT '', review_due date,
 created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE budgets (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), name text NOT NULL UNIQUE, currency text NOT NULL CHECK(currency ~ '^[A-Z]{3}$'),
 starts_on date NOT NULL, ends_on date NOT NULL, limit_amount numeric(14,2) NOT NULL CHECK(limit_amount>0),
 CHECK(ends_on>=starts_on), created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE orders (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), reference text NOT NULL UNIQUE, supplier_id uuid NOT NULL REFERENCES suppliers,
 budget_id uuid REFERENCES budgets, title text NOT NULL, requester text NOT NULL CHECK(length(trim(requester))>0),
 currency text NOT NULL CHECK(currency ~ '^[A-Z]{3}$'), ordered_on date NOT NULL DEFAULT current_date, due_on date,
 status text NOT NULL DEFAULT 'draft' CHECK(status IN ('draft','approved','closed','cancelled')),
 approver text, approved_at timestamptz, source_id text UNIQUE, source_row jsonb, source_status text,
 created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(),
 CHECK(status NOT IN ('approved','closed') OR (approver IS NOT NULL AND approved_at IS NOT NULL AND lower(trim(approver))<>lower(trim(requester))))
);
CREATE TABLE order_lines (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), order_id uuid NOT NULL REFERENCES orders, line_ref text NOT NULL,
 description text NOT NULL, quantity numeric(14,3) NOT NULL CHECK(quantity>0), unit_price numeric(14,2) NOT NULL CHECK(unit_price>=0),
 source_row jsonb, UNIQUE(order_id,line_ref), created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE receipts (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), line_id uuid NOT NULL REFERENCES order_lines,
 reference text NOT NULL, quantity numeric(14,3) NOT NULL CHECK(quantity>0), received_on date NOT NULL DEFAULT current_date,
 evidence_ref text NOT NULL DEFAULT '', UNIQUE(line_id,reference), created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE invoices (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), line_id uuid NOT NULL REFERENCES order_lines,
 reference text NOT NULL, quantity numeric(14,3) NOT NULL CHECK(quantity>0), unit_price numeric(14,2) NOT NULL CHECK(unit_price>=0),
 issued_on date NOT NULL, due_on date NOT NULL, tax_year_end date NOT NULL, retain_until date NOT NULL,
 evidence_ref text NOT NULL DEFAULT '', UNIQUE(line_id,reference), CHECK(due_on>=issued_on), CHECK(tax_year_end>=issued_on),
 CHECK(retain_until>=(tax_year_end+interval '7 years')::date),
 created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE activity (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), order_id uuid REFERENCES orders, action text NOT NULL,
 actor text NOT NULL, note text NOT NULL, created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
DO $$ DECLARE t text; BEGIN FOREACH t IN ARRAY ARRAY['suppliers','budgets','orders','order_lines','receipts','invoices','activity'] LOOP
 EXECUTE format('CREATE TRIGGER touch BEFORE UPDATE ON %I FOR EACH ROW EXECUTE FUNCTION touch_updated()',t);
 END LOOP; END $$;
CREATE VIEW line_position AS
 SELECT l.id,l.order_id,o.reference,o.status,s.name AS supplier,o.currency,o.due_on,l.line_ref,l.description,l.quantity,l.unit_price,
 round(l.quantity*l.unit_price,2) AS ordered_value,
 coalesce(r.received,0) AS received,coalesce(i.invoiced,0) AS invoiced,coalesce(i.invoice_value,0) AS invoice_value,
 l.quantity-coalesce(r.received,0) AS outstanding,
 coalesce(i.price_variance,false) AS price_variance,
 coalesce(i.invoiced,0)>coalesce(r.received,0) AS invoice_ahead_of_receipt,
 coalesce(i.invoiced,0)>l.quantity AS over_invoiced
 FROM order_lines l JOIN orders o ON o.id=l.order_id JOIN suppliers s ON s.id=o.supplier_id
 LEFT JOIN (SELECT line_id,sum(quantity) AS received FROM receipts GROUP BY line_id) r ON r.line_id=l.id
 LEFT JOIN (SELECT x.line_id,sum(x.quantity) AS invoiced, sum(round(x.quantity*x.unit_price,2)) AS invoice_value,
 bool_or(x.unit_price<>ol.unit_price) AS price_variance FROM invoices x JOIN order_lines ol ON ol.id=x.line_id GROUP BY x.line_id) i ON i.line_id=l.id;
CREATE VIEW order_position AS
 SELECT o.id,o.reference,o.title,s.name AS supplier,o.requester,o.currency,o.ordered_on,o.due_on,o.status,o.budget_id,
 coalesce(sum(l.ordered_value),0) AS ordered_value,coalesce(sum(round(l.received*l.unit_price,2)),0) AS received_value,
 coalesce(sum(l.invoice_value),0) AS invoiced_value,coalesce(sum(l.outstanding),0) AS outstanding_quantity,
 coalesce(bool_or(l.price_variance OR l.invoice_ahead_of_receipt OR l.over_invoiced),false) AS mismatch,
 coalesce((SELECT max(a.created_at) FROM activity a WHERE a.order_id=o.id),o.created_at) AS last_activity
 FROM orders o JOIN suppliers s ON s.id=o.supplier_id LEFT JOIN line_position l ON l.order_id=o.id GROUP BY o.id,s.name;
CREATE VIEW budget_position AS
 SELECT b.id,b.name,b.currency,b.starts_on,b.ends_on,b.limit_amount,
 coalesce(sum(p.ordered_value) FILTER(WHERE p.status IN ('approved','closed')),0) AS committed,
 coalesce(sum(p.ordered_value) FILTER(WHERE p.status='draft'),0) AS requested,
 b.limit_amount-coalesce(sum(p.ordered_value) FILTER(WHERE p.status IN ('approved','closed')),0) AS remaining
 FROM budgets b LEFT JOIN order_position p ON p.budget_id=b.id AND p.currency=b.currency AND p.ordered_on BETWEEN b.starts_on AND b.ends_on GROUP BY b.id;
CREATE VIEW compliance_findings AS
 SELECT 'NZ-RECORD-01' AS rule,o.reference AS record,'Invoice evidence missing: '||i.reference AS finding,
 'https://www.ird.govt.nz/managing-my-tax/record-keeping' AS source
 FROM invoices i JOIN order_lines l ON l.id=i.line_id JOIN orders o ON o.id=l.order_id WHERE trim(i.evidence_ref)=''
 UNION ALL SELECT 'POLICY-SUPPLIER',s.name,'Supplier review overdue','docs/compliance.md' FROM suppliers s WHERE s.review_due<current_date
 UNION ALL SELECT 'POLICY-APPROVAL',reference,'Imported approval requires local review','docs/compliance.md' FROM orders WHERE source_status IS NOT NULL AND status='draft'
 UNION ALL SELECT 'POLICY-MATCH',reference,'Invoice quantity or price differs from receipt or order','docs/compliance.md' FROM line_position WHERE price_variance OR invoice_ahead_of_receipt OR over_invoiced
 UNION ALL SELECT 'POLICY-RECEIPT',o.reference,'Receipt evidence missing: '||r.reference,'docs/compliance.md' FROM receipts r JOIN order_lines l ON l.id=r.line_id JOIN orders o ON o.id=l.order_id WHERE trim(r.evidence_ref)='';
