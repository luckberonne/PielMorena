import React, { useState } from 'react';
import { Upload, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { CreateProductData, PRODUCT_CATEGORIES } from '../types/product';

interface BulkUploadFormProps {
  onClose: () => void;
  showFeedback: (type: 'success' | 'error', message: string) => void;
}

interface FolderStructure {
  [productName: string]: File[];
}

export default function BulkUploadForm({ onClose, showFeedback }: BulkUploadFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [folderStructure, setFolderStructure] = useState<FolderStructure>({});
  const [price, setPrice] = useState<string>('');

  const handleFolderSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const structure: FolderStructure = {};

    // Process files and organize them by folder
    files.forEach(file => {
      // Get the folder name (product name) from the path
      const pathParts = file.webkitRelativePath.split('/');
      if (pathParts.length < 2) return; // Skip if not in a subfolder

      const folderName = pathParts[1]; // The product name (folder name)
      
      // Validate file type and size
      const isValidType = ['image/jpeg', 'image/png', 'image/webp'].includes(file.type);
      const isValidSize = file.size <= 5 * 1024 * 1024; // 5MB

      if (!isValidType || !isValidSize) {
        showFeedback('error', `Archivo inválido en ${folderName}: ${file.name}. Debe ser JPG, PNG o WebP y no exceder 5MB`);
        return;
      }

      // Add file to structure
      if (!structure[folderName]) {
        structure[folderName] = [];
      }
      structure[folderName].push(file);
    });

    setFolderStructure(structure);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (!selectedCategory) {
      showFeedback('error', 'Debes seleccionar una categoría');
      return;
    }

    if (Object.keys(folderStructure).length === 0) {
      showFeedback('error', 'No se han seleccionado archivos');
      return;
    }

    try {
      setIsSubmitting(true);

      // Process each folder (product)
      for (const [productName, files] of Object.entries(folderStructure)) {
        if (files.length === 0) continue;
        if (files.length > 5) {
          showFeedback('error', `El producto ${productName} tiene más de 5 imágenes`);
          continue;
        }

        // Create product
        const productData: CreateProductData = {
          name: productName,
          price: price ? parseFloat(price) : undefined,
          description: `Producto: ${productName}`,
          featured: false,
          category: selectedCategory
        };

        const { data: product, error: productError } = await supabase
          .from('products')
          .insert(productData)
          .select()
          .single();

        if (productError) {
          console.error(`Error creating product ${productName}:`, productError);
          continue;
        }

        // Upload images
        for (let i = 0; i < files.length; i++) {
          const file = files[i];
          const fileExt = file.name.split('.').pop();
          const fileName = `${product.id}/${Date.now()}-${i}.${fileExt}`;

          const { error: uploadError } = await supabase.storage
            .from('product-images')
            .upload(fileName, file);

          if (uploadError) {
            console.error(`Error uploading image for ${productName}:`, uploadError);
            continue;
          }

          const { data: { publicUrl } } = supabase.storage
            .from('product-images')
            .getPublicUrl(fileName);

          // Insert image record
          const { error: imageError } = await supabase
            .from('product_images')
            .insert({
              product_id: product.id,
              image_url: publicUrl,
              order: i
            });

          if (imageError) {
            console.error(`Error creating image record for ${productName}:`, imageError);
          }
        }
      }

      showFeedback('success', 'Productos cargados correctamente');
      onClose();
    } catch (err) {
      console.error('Error in bulk upload:', err);
      showFeedback('error', 'Error al cargar los productos');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Categoría
        </label>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#2c2420] focus:ring focus:ring-[#2c2420] focus:ring-opacity-50"
          required
        >
          <option value="">Seleccionar categoría</option>
          {PRODUCT_CATEGORIES.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Precio (opcional)
        </label>
        <div className="mt-1 relative rounded-md shadow-sm">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span className="text-gray-500 sm:text-sm">$</span>
          </div>
          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="pl-7 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#2c2420] focus:ring focus:ring-[#2c2420] focus:ring-opacity-50"
            step="0.01"
            min="0"
            max="99999.99"
            placeholder="Precio para todos los productos"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Seleccionar Carpeta
          <span className="text-sm text-gray-500 ml-1">
            (cada subcarpeta será un producto)
          </span>
        </label>
        <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md hover:border-[#2c2420] transition-colors duration-300">
          <div className="space-y-1 text-center">
            <Upload className="mx-auto h-12 w-12 text-gray-400" />
            <div className="flex text-sm text-gray-600">
              <label htmlFor="folder-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-[#2c2420] hover:text-[#3c3430] focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-[#2c2420]">
                <span>Seleccionar carpeta</span>
                <input
                  id="folder-upload"
                  type="file"
                  className="sr-only"
                  webkitdirectory=""
                  directory=""
                  multiple
                  onChange={handleFolderSelect}
                  accept="image/jpeg,image/png,image/webp"
                />
              </label>
            </div>
            <p className="text-xs text-gray-500">
              Máximo 5 imágenes por producto (JPG, PNG, WebP, máx. 5MB c/u)
            </p>
          </div>
        </div>

        {Object.keys(folderStructure).length > 0 && (
          <div className="mt-4">
            <h4 className="font-medium text-gray-700 mb-2">Productos detectados:</h4>
            <ul className="space-y-2">
              {Object.entries(folderStructure).map(([productName, files]) => (
                <li key={productName} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                  <span>{productName}</span>
                  <span className="text-sm text-gray-500">{files.length} imágenes</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="mt-6 flex justify-end space-x-3">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          disabled={isSubmitting}
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-[#2c2420] text-white rounded-md hover:bg-[#3c3430] disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          disabled={isSubmitting || Object.keys(folderStructure).length === 0}
        >
          {isSubmitting ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
              Cargando productos...
            </>
          ) : (
            'Cargar Productos'
          )}
        </button>
      </div>
    </form>
  );
}