INSERT INTO suppliers(id,name,contact,evidence_ref,review_due) VALUES
('10000000-0000-0000-0000-000000000001','Harbour Packaging','Riley Chen','demo://supplier/harbour',current_date-15),
('10000000-0000-0000-0000-000000000002','Harbour Industrial','Morgan King','demo://supplier/industrial',current_date+90),
('10000000-0000-0000-0000-000000000003','Southern Office','Alex Bell','demo://supplier/office',current_date+30) ON CONFLICT DO NOTHING;
INSERT INTO budgets(id,name,currency,starts_on,ends_on,limit_amount) VALUES
('20000000-0000-0000-0000-000000000001','Operations NZ','NZD',current_date-365,current_date+365,20000),
('20000000-0000-0000-0000-000000000002','Office AU','AUD',current_date-365,current_date+365,9000) ON CONFLICT DO NOTHING;
INSERT INTO orders(id,reference,supplier_id,budget_id,title,requester,currency,ordered_on,due_on,status,approver,approved_at,created_at) VALUES
('30000000-0000-0000-0000-000000000001','PO-1001','10000000-0000-0000-0000-000000000001','20000000-0000-0000-0000-000000000001','Cartons for spring dispatch','Aroha','NZD',current_date-20,current_date-5,'approved','Blair',now()-interval '19 days',now()-interval '20 days'),
('30000000-0000-0000-0000-000000000002','PO-1002','10000000-0000-0000-0000-000000000002','20000000-0000-0000-0000-000000000001','Workshop gloves','Casey','NZD',current_date-10,current_date+3,'draft',NULL,NULL,now()-interval '10 days'),
('30000000-0000-0000-0000-000000000003','PO-1003','10000000-0000-0000-0000-000000000003','20000000-0000-0000-0000-000000000002','Office supplies','Drew','AUD',current_date-3,current_date+7,'approved','Eden',now()-interval '2 days',now()-interval '3 days') ON CONFLICT DO NOTHING;
INSERT INTO order_lines(id,order_id,line_ref,description,quantity,unit_price) VALUES
('40000000-0000-0000-0000-000000000001','30000000-0000-0000-0000-000000000001','1','Shipping cartons',1000,2.50),
('40000000-0000-0000-0000-000000000002','30000000-0000-0000-0000-000000000001','2','Packing tape',100,6),
('40000000-0000-0000-0000-000000000003','30000000-0000-0000-0000-000000000002','1','Protective gloves',40,24),
('40000000-0000-0000-0000-000000000004','30000000-0000-0000-0000-000000000003','1','Archive boxes',20,12) ON CONFLICT DO NOTHING;
INSERT INTO receipts(id,line_id,reference,quantity,received_on,evidence_ref) VALUES
('50000000-0000-0000-0000-000000000001','40000000-0000-0000-0000-000000000001','GR-2001',600,current_date-6,'demo://receipt/2001'),
('50000000-0000-0000-0000-000000000002','40000000-0000-0000-0000-000000000002','GR-2002',100,current_date-6,'') ON CONFLICT DO NOTHING;
INSERT INTO invoices(id,line_id,reference,quantity,unit_price,issued_on,due_on,tax_year_end,retain_until,evidence_ref)
SELECT '60000000-0000-0000-0000-000000000001','40000000-0000-0000-0000-000000000001','INV-3001',1000,2.75,current_date-4,current_date+26,
 (date_trunc('year',current_date)+interval '1 year - 1 day')::date,(date_trunc('year',current_date)+interval '8 years - 1 day')::date,'' ON CONFLICT DO NOTHING;
INSERT INTO activity(id,order_id,action,actor,note,created_at) VALUES
('70000000-0000-0000-0000-000000000001','30000000-0000-0000-0000-000000000001','log','Blair','Supplier promised balance; awaiting delivery confirmation',now()-interval '16 days') ON CONFLICT DO NOTHING;
