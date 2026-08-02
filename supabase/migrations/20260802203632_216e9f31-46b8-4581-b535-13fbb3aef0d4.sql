CREATE POLICY "auth read product storage" ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id IN ('product-images','product-files'));
CREATE POLICY "auth upload product storage" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id IN ('product-images','product-files'));
CREATE POLICY "auth update product storage" ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id IN ('product-images','product-files'))
  WITH CHECK (bucket_id IN ('product-images','product-files'));
CREATE POLICY "auth delete product storage" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id IN ('product-images','product-files'));