import { useState } from "react";
import { motion } from "framer-motion";
import ShopNav from "../../components/ShopNav";
import {
  Plus,
  Search,
  Grid,
  List,
  Edit,
  XCircle,
  CheckCircle,
  Star,
} from "lucide-react";

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  stock: number;
  category: string;
  views: number;
  rating: number;
  reviews: number;
  isAvailable: boolean;
  images: string[];
}

// Add Product Form Component
const AddProductForm = ({ onSave, onCancel }: { onSave: (product: any) => void; onCancel: () => void }) => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    originalPrice: "",
    discount: "",
    stock: "",
    category: "Electronics",
    images: [""]
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const product = {
      name: formData.name,
      description: formData.description,
      price: parseFloat(formData.price) || 0,
      originalPrice: formData.originalPrice ? parseFloat(formData.originalPrice) : undefined,
      discount: formData.discount ? parseInt(formData.discount) : undefined,
      stock: parseInt(formData.stock) || 0,
      category: formData.category,
      images: formData.images.filter((img: string) => img.trim() !== "")
    };
    onSave(product);
  };

  const addImageField = () => {
    setFormData(prev => ({ ...prev, images: [...prev.images, ""] }));
  };

  const updateImage = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.map((img: string, i: number) => (i === index ? value : img))
    }));
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_: string, i: number) => i !== index)
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-slate-400 mb-1">Product Name</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
            required
          />
        </div>
        <div>
          <label className="block text-sm text-slate-400 mb-1">Category</label>
          <select
            value={formData.category}
            onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
            className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="Electronics">Electronics</option>
            <option value="Mobile Phones">Mobile Phones</option>
            <option value="Accessories">Accessories</option>
            <option value="Laptops">Laptops</option>
            <option value="Gaming">Gaming</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm text-slate-400 mb-1">Description</label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
          rows={3}
          required
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm text-slate-400 mb-1">Price (K)</label>
          <input
            type="number"
            value={formData.price}
            onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
            className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
            required
          />
        </div>
        <div>
          <label className="block text-sm text-slate-400 mb-1">Original Price (K)</label>
          <input
            type="number"
            value={formData.originalPrice}
            onChange={(e) => setFormData(prev => ({ ...prev, originalPrice: e.target.value }))}
            className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
        <div>
          <label className="block text-sm text-slate-400 mb-1">Stock</label>
          <input
            type="number"
            value={formData.stock}
            onChange={(e) => setFormData(prev => ({ ...prev, stock: e.target.value }))}
            className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
            required
          />
        </div>
      </div>

      <div>
        <label className="block text-sm text-slate-400 mb-1">Product Images</label>
        <div className="space-y-2">
          {formData.images.map((image: string, index: number) => (
            <div key={index} className="flex space-x-2">
              <input
                type="url"
                value={image}
                onChange={(e) => updateImage(index, e.target.value)}
                placeholder="Image URL"
                className="flex-1 px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              {formData.images.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="px-3 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg"
                >
                  Remove
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={addImageField}
            className="text-primary-500 hover:text-primary-400 text-sm"
          >
            + Add Image
          </button>
        </div>
      </div>

      <div className="flex space-x-3 pt-4">
        <button
          type="submit"
          className="bg-primary-500 hover:bg-primary-600 text-white px-6 py-2 rounded-lg transition-colors duration-200"
        >
          Add Product
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="bg-slate-600 hover:bg-slate-700 text-white px-6 py-2 rounded-lg transition-colors duration-200"
        >
          Cancel
        </button>
      </div>
    </form>
  );
};

// Edit Product Form Component
const EditProductForm = ({ product, onSave, onCancel }: { product: Product; onSave: (product: any) => void; onCancel: () => void }) => {
  const [formData, setFormData] = useState({
    name: product?.name || "",
    description: product?.description || "",
    price: product?.price?.toString() || "",
    originalPrice: product?.originalPrice?.toString() || "",
    discount: product?.discount?.toString() || "",
    stock: product?.stock?.toString() || "",
    category: product?.category || "Electronics",
    images: product?.images || [""]
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedProduct = {
      name: formData.name,
      description: formData.description,
      price: parseFloat(formData.price) || 0,
      originalPrice: formData.originalPrice ? parseFloat(formData.originalPrice) : undefined,
      discount: formData.discount ? parseInt(formData.discount) : undefined,
      stock: parseInt(formData.stock) || 0,
      category: formData.category,
      images: formData.images.filter((img: string) => img.trim() !== "")
    };
    onSave(updatedProduct);
  };

  const addImageField = () => {
    setFormData(prev => ({ ...prev, images: [...prev.images, ""] }));
  };

  const updateImage = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.map((img: string, i: number) => (i === index ? value : img))
    }));
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_: string, i: number) => i !== index)
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-slate-400 mb-1">Product Name</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
            required
          />
        </div>
        <div>
          <label className="block text-sm text-slate-400 mb-1">Category</label>
          <select
            value={formData.category}
            onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
            className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="Electronics">Electronics</option>
            <option value="Mobile Phones">Mobile Phones</option>
            <option value="Accessories">Accessories</option>
            <option value="Laptops">Laptops</option>
            <option value="Gaming">Gaming</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm text-slate-400 mb-1">Description</label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
          rows={3}
          required
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm text-slate-400 mb-1">Price (K)</label>
          <input
            type="number"
            value={formData.price}
            onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
            className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
            required
          />
        </div>
        <div>
          <label className="block text-sm text-slate-400 mb-1">Original Price (K)</label>
          <input
            type="number"
            value={formData.originalPrice}
            onChange={(e) => setFormData(prev => ({ ...prev, originalPrice: e.target.value }))}
            className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
        <div>
          <label className="block text-sm text-slate-400 mb-1">Stock</label>
          <input
            type="number"
            value={formData.stock}
            onChange={(e) => setFormData(prev => ({ ...prev, stock: e.target.value }))}
            className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
            required
          />
        </div>
      </div>

      <div>
        <label className="block text-sm text-slate-400 mb-1">Product Images</label>
        <div className="space-y-2">
          {formData.images.map((image: string, index: number) => (
            <div key={index} className="flex space-x-2">
              <input
                type="url"
                value={image}
                onChange={(e) => updateImage(index, e.target.value)}
                placeholder="Image URL"
                className="flex-1 px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              {formData.images.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="px-3 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg"
                >
                  Remove
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={addImageField}
            className="text-primary-500 hover:text-primary-400 text-sm"
          >
            + Add Image
          </button>
        </div>
      </div>

      <div className="flex space-x-3 pt-4">
        <button
          type="submit"
          className="bg-primary-500 hover:bg-primary-600 text-white px-6 py-2 rounded-lg transition-colors duration-200"
        >
          Save Changes
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="bg-slate-600 hover:bg-slate-700 text-white px-6 py-2 rounded-lg transition-colors duration-200"
        >
          Cancel
        </button>
      </div>
    </form>
  );
};

function ProductsPage() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("name");
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [editingProduct, setEditingProduct] = useState<number | null>(null);

  // Sample products data
  const [products, setProducts] = useState<Product[]>([
    {
      id: 1,
      name: "iPhone 15 Pro Max 256GB",
      description: "Latest iPhone with advanced camera system and A17 Pro chip",
      price: 8500,
      originalPrice: 9500,
      discount: 11,
      stock: 5,
      category: "Mobile Phones",
      views: 45,
      rating: 4.9,
      reviews: 23,
      isAvailable: true,
      images: [
        "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400",
        "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400",
      ],
    },
    {
      id: 2,
      name: "Samsung Galaxy S24 Ultra",
      description: "Premium Android smartphone with S Pen and advanced AI features",
      price: 7800,
      originalPrice: 8200,
      discount: 5,
      stock: 8,
      category: "Mobile Phones",
      views: 32,
      rating: 4.7,
      reviews: 18,
      isAvailable: true,
      images: [
        "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400",
      ],
    },
    {
      id: 3,
      name: "AirPods Pro 2nd Gen",
      description: "Active noise cancellation with spatial audio",
      price: 450,
      stock: 12,
      category: "Accessories",
      views: 28,
      rating: 4.6,
      reviews: 34,
      isAvailable: true,
      images: [
        "https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?w=400",
      ],
    },
    {
      id: 4,
      name: "MacBook Air M2 13-inch",
      description: "Ultra-thin laptop with M2 chip and all-day battery life",
      price: 12000,
      stock: 2,
      category: "Laptops",
      views: 67,
      rating: 4.8,
      reviews: 12,
      isAvailable: true,
      images: [
        "https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=400",
      ],
    },
    {
      id: 5,
      name: "PlayStation 5 Console",
      description: "Next-gen gaming console with 4K gaming and ray tracing",
      price: 3500,
      stock: 0,
      category: "Gaming",
      views: 89,
      rating: 4.9,
      reviews: 28,
      isAvailable: false,
      images: [
        "https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=400",
      ],
    },
  ]);

  const categories = [
    "all",
    ...Array.from(new Set(products.map((p) => p.category))),
  ];

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      selectedCategory === "all" || product.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case "price-low":
        return a.price - b.price;
      case "price-high":
        return b.price - a.price;
      case "rating":
        return b.rating - a.rating;
      case "views":
        return b.views - a.views;
      case "name":
      default:
        return a.name.localeCompare(b.name);
    }
  });

  // Product management functions
  const handleAddProduct = (newProduct: any) => {
    const product = {
      ...newProduct,
      id: Math.max(...products.map((p) => p.id)) + 1,
      views: 0,
      rating: 5.0,
      reviews: 0,
      isAvailable: true,
    } as Product;
    setProducts((prev) => [...prev, product]);
    setShowAddProduct(false);
  };

  const handleSaveProduct = (productId: number, updatedProduct: any) => {
    setProducts((prev) => prev.map((p) => (p.id === productId ? { ...p, ...updatedProduct } : p)));
    setEditingProduct(null);
  };

  const handleCancelEdit = () => {
    setEditingProduct(null);
  };

  const handleUpdateProductStatus = (productId: number, isAvailable: boolean) => {
    setProducts((prev) => prev.map((p) => (p.id === productId ? { ...p, isAvailable } : p)));
  };

  const handleUpdateProductQuantity = (productId: number, stock: number) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, stock, isAvailable: stock > 0 } : p))
    );
  };

  const handleRemoveProduct = (productId: number) => {
    setProducts((prev) => prev.filter((p) => p.id !== productId));
  };

  return (
    <div className="min-h-screen bg-slate-900">
      <ShopNav />
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-100 mb-2">Products</h1>
            <p className="text-slate-400">Manage your product inventory and catalog</p>
          </div>
          <button
            onClick={() => setShowAddProduct(true)}
            className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors duration-200"
          >
            <Plus className="h-4 w-4" />
            <span>Add Product</span>
          </button>
        </div>

        {/* Search and Filters */}
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                />
              </div>
            </div>

            {/* Category Filter */}
            <div className="md:w-48">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
              >
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category === "all" ? "All Categories" : category}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort */}
            <div className="md:w-40">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
              >
                <option value="name">Sort by Name</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
                <option value="views">Most Viewed</option>
              </select>
            </div>

            {/* View Mode */}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded-lg transition-colors duration-200 ${
                  viewMode === "grid" ? "bg-primary-500 text-white" : "bg-slate-700 text-slate-400 hover:text-slate-300"
                }`}
              >
                <Grid className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 rounded-lg transition-colors duration-200 ${
                  viewMode === "list" ? "bg-primary-500 text-white" : "bg-slate-700 text-slate-400 hover:text-slate-300"
                }`}
              >
                <List className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Add Product Modal */}
        {showAddProduct && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-slate-800 rounded-xl border border-slate-700 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-slate-100">Add New Product</h3>
                  <button onClick={() => setShowAddProduct(false)} className="text-slate-400 hover:text-slate-300">
                    <XCircle className="h-6 w-6" />
                  </button>
                </div>
                <AddProductForm onSave={handleAddProduct} onCancel={() => setShowAddProduct(false)} />
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Edit Product Modal */}
        {editingProduct && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-slate-800 rounded-xl border border-slate-700 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-slate-100">Edit Product</h3>
                  <button onClick={handleCancelEdit} className="text-slate-400 hover:text-slate-300">
                    <XCircle className="h-6 w-6" />
                  </button>
                </div>
                <EditProductForm
                  product={products.find((p) => p.id === editingProduct)!}
                  onSave={(updatedProduct) => handleSaveProduct(editingProduct, updatedProduct)}
                  onCancel={handleCancelEdit}
                />
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Products Grid/List */}
        {viewMode === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedProducts.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + index * 0.05 }}
                className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden hover:border-slate-600 transition-colors duration-200 group"
              >
                {/* Product Image */}
                <div className="relative h-48 overflow-hidden">
                  <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  {product.discount && (
                    <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-medium">-{product.discount}%</div>
                  )}
                  {!product.isAvailable && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <span className="bg-slate-800 text-slate-100 px-3 py-1 rounded-full text-sm font-medium">Out of Stock</span>
                    </div>
                  )}
                  <div className="absolute top-2 right-2 flex space-x-1">
                    <button onClick={() => setEditingProduct(product.id)} className="p-1 bg-slate-800/80 text-slate-400 hover:text-slate-300 rounded-full transition-colors duration-200">
                      <Edit className="h-3 w-3" />
                    </button>
                    <button onClick={() => handleRemoveProduct(product.id)} className="p-1 bg-slate-800/80 text-slate-400 hover:text-red-400 rounded-full transition-colors duration-200">
                      <XCircle className="h-3 w-3" />
                    </button>
                  </div>
                </div>

                {/* Product Info */}
                <div className="p-4">
                  <h3 className="font-semibold text-slate-100 mb-2 group-hover:text-primary-400 transition-colors duration-200">{product.name}</h3>
                  <p className="text-slate-400 text-sm mb-3 line-clamp-2">{product.description}</p>

                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <span className="text-lg font-bold text-slate-100">K{product.price.toLocaleString()}</span>
                      {product.originalPrice && (
                        <span className="text-sm text-slate-500 line-through">K{product.originalPrice.toLocaleString()}</span>
                      )}
                    </div>
                    <div className="flex items-center space-x-1">
                      <Star className="h-3 w-3 text-yellow-400 fill-current" />
                      <span className="text-xs text-slate-400">{product.rating} ({product.reviews})</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-400 mb-3">
                    <span>{product.category}</span>
                    <span>{product.views} views</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleUpdateProductStatus(product.id, !product.isAvailable)}
                        className={`flex items-center space-x-1 text-xs transition-colors duration-200 ${product.isAvailable ? "text-green-400 hover:text-green-300" : "text-red-400 hover:text-red-300"}`}
                      >
                        {product.isAvailable ? (
                          <>
                            <CheckCircle className="h-3 w-3" />
                            <span>In Stock</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="h-3 w-3" />
                            <span>Out of Stock</span>
                          </>
                        )}
                      </button>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => {
                          const newStock = Math.max(0, product.stock - 1);
                          handleUpdateProductQuantity(product.id, newStock);
                        }}
                        className="w-6 h-6 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-full flex items-center justify-center text-sm transition-colors duration-200"
                      >
                        -
                      </button>
                      <span className="text-xs text-slate-400 min-w-[2rem] text-center">{product.stock}</span>
                      <button
                        onClick={() => {
                          const newStock = product.stock + 1;
                          handleUpdateProductQuantity(product.id, newStock);
                        }}
                        className="w-6 h-6 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-full flex items-center justify-center text-sm transition-colors duration-200"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {sortedProducts.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 + index * 0.05 }}
                className="bg-slate-800 rounded-xl border border-slate-700 p-4 hover:border-slate-600 transition-colors duration-200 group"
              >
                <div className="flex items-center space-x-4">
                  <div className="relative w-20 h-20 flex-shrink-0">
                    <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover rounded-lg" />
                    {product.discount && (
                      <div className="absolute -top-1 -right-1 bg-red-500 text-white px-1 py-0.5 rounded-full text-xs">-{product.discount}%</div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-slate-100 mb-1 group-hover:text-primary-400 transition-colors duration-200">{product.name}</h3>
                    <p className="text-slate-400 text-sm mb-2 line-clamp-1">{product.description}</p>
                    <div className="flex items-center space-x-4 text-sm">
                      <div className="flex items-center space-x-1">
                        <Star className="h-3 w-3 text-yellow-400 fill-current" />
                        <span className="text-slate-400">{product.rating}</span>
                      </div>
                      <span className="text-slate-400">{product.category}</span>
                      <span className="text-slate-400">{product.views} views</span>
                      <div className="flex items-center space-x-1">
                        <button
                          onClick={() => handleUpdateProductStatus(product.id, !product.isAvailable)}
                          className={`flex items-center space-x-1 text-xs transition-colors duration-200 ${product.isAvailable ? "text-green-400 hover:text-green-300" : "text-red-400 hover:text-red-300"}`}
                        >
                          {product.isAvailable ? (
                            <>
                              <CheckCircle className="h-3 w-3" />
                              <span>In Stock</span>
                            </>
                          ) : (
                            <>
                              <XCircle className="h-3 w-3" />
                              <span>Out of Stock</span>
                            </>
                          )}
                        </button>
                        <div className="flex items-center space-x-1">
                          <button
                            onClick={() => {
                              const newStock = Math.max(0, product.stock - 1);
                              handleUpdateProductQuantity(product.id, newStock);
                            }}
                            className="w-5 h-5 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-full flex items-center justify-center text-xs transition-colors duration-200"
                          >
                            -
                          </button>
                          <span className="text-xs text-slate-400 min-w-[1.5rem] text-center">{product.stock}</span>
                          <button
                            onClick={() => {
                              const newStock = product.stock + 1;
                              handleUpdateProductQuantity(product.id, newStock);
                            }}
                            className="w-5 h-5 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-full flex items-center justify-center text-xs transition-colors duration-200"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-lg font-bold text-slate-100 mb-1">K{product.price.toLocaleString()}</div>
                    {product.originalPrice && (
                      <div className="text-sm text-slate-500 line-through">K{product.originalPrice.toLocaleString()}</div>
                    )}
                    <div className="text-xs text-slate-400 mt-1">{product.stock} units</div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button onClick={() => setEditingProduct(product.id)} className="p-2 text-slate-400 hover:text-slate-300 hover:bg-slate-700 rounded-lg transition-colors duration-200">
                      <Edit className="h-4 w-4" />
                    </button>
                    <button onClick={() => handleRemoveProduct(product.id)} className="p-2 text-slate-400 hover:text-red-400 hover:bg-slate-700 rounded-lg transition-colors duration-200">
                      <XCircle className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {sortedProducts.length === 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12">
            <div className="text-xl font-semibold text-slate-100 mb-2">No products found</div>
            <p className="text-slate-400 mb-4">Try adjusting your search or filter criteria</p>
            <button
              onClick={() => setShowAddProduct(true)}
              className="bg-primary-500 hover:bg-primary-600 text-white px-6 py-2 rounded-lg font-medium transition-colors duration-200"
            >
              Add Your First Product
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
}

export default ProductsPage;
   