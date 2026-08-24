"use client";

import { useState } from "react";
import ShopNav from "@/components/ShopNav";
import { Plus, Search, Edit, XCircle, CheckCircle, Star, Loader2, Trash2, Package } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useAuthStore } from "@/store/authStore";
import { useProducts, updateProduct, deleteProduct, type ProductData } from "@/hooks/useApi";

export default function ProductsPage() {
  const { user } = useAuthStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [adjustingStock, setAdjustingStock] = useState<string | null>(null);

  const { data, loading, refetch } = useProducts({
    shopId: user?.id || undefined,
    search: searchQuery || undefined,
    category: selectedCategory !== "all" ? selectedCategory : undefined,
  });

  const products = data?.products || [];
  const categories = ["all", ...Array.from(new Set(products.map((p) => p.category)))];

  const handleToggleStock = async (product: ProductData) => {
    setAdjustingStock(product.id);
    try {
      await updateProduct(product.id, { isAvailable: !product.isAvailable });
      refetch();
    } catch (e) {
      console.error("Failed to toggle stock:", e);
    } finally {
      setAdjustingStock(null);
    }
  };

  const handleAdjustStock = async (product: ProductData, delta: number) => {
    setAdjustingStock(product.id);
    try {
      const newStock = Math.max(0, product.stock + delta);
      await updateProduct(product.id, {
        stock: newStock,
        isAvailable: newStock > 0,
      });
      refetch();
    } catch (e) {
      console.error("Failed to adjust stock:", e);
    } finally {
      setAdjustingStock(null);
    }
  };

  const handleRemoveProduct = async (productId: string) => {
    if (!confirm("Are you sure you want to remove this product?")) return;
    try {
      await deleteProduct(productId);
      refetch();
    } catch (e) {
      console.error("Failed to delete product:", e);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <ShopNav userId={user?.id} />
      <main className="p-3 sm:p-4 space-y-4 max-w-5xl mx-auto">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold">Products</h1>
            <p className="text-xs text-muted-foreground">Manage your inventory</p>
          </div>
          <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90"><Plus className="h-4 w-4 mr-1" />Add</Button>
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input placeholder="Search products..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
          </div>
          <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} className="px-3 py-2 bg-muted border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring">
            {categories.map((c) => <option key={c} value={c}>{c === "all" ? "All" : c}</option>)}
          </select>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Package className="h-10 w-10 mx-auto mb-3 opacity-50" />
            <p className="text-sm font-medium">No products yet</p>
            <p className="text-xs">Add your first product to get started</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {products.map((product) => (
              <Card key={product.id} className="bg-card border-border hover:border-primary/20 transition-colors">
                <CardContent className="p-3">
                  <div className="flex items-start justify-between mb-2">
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold text-sm truncate">{product.name}</h3>
                      <p className="text-[10px] text-muted-foreground line-clamp-1">{product.description}</p>
                    </div>
                    <div className="flex gap-1 shrink-0 ml-2">
                      <Button variant="ghost" size="icon" className="h-6 w-6"><Edit className="h-3 w-3" /></Button>
                      <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive" onClick={() => handleRemoveProduct(product.id)}><Trash2 className="h-3 w-3" /></Button>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-base font-bold">K{product.price.toLocaleString()}</span>
                    {product.originalPrice && <span className="text-[10px] text-muted-foreground line-through">K{product.originalPrice.toLocaleString()}</span>}
                    {product.discount && <Badge variant="secondary" className="text-[9px] bg-rose-500/10 text-rose-500">-{product.discount}%</Badge>}
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-muted-foreground mb-2">
                    <div className="flex items-center gap-0.5"><Star className="h-2.5 w-2.5 text-yellow-400 fill-yellow-400" />{product.rating} ({product.reviews})</div>
                    <span>{product.views} views</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <button
                      onClick={() => handleToggleStock(product)}
                      disabled={adjustingStock === product.id}
                      className={`flex items-center gap-1 text-[10px] font-medium ${product.isAvailable ? "text-emerald-500" : "text-destructive"}`}
                    >
                      {adjustingStock === product.id ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : product.isAvailable ? (
                        <><CheckCircle className="h-3 w-3" />In Stock</>
                      ) : (
                        <><XCircle className="h-3 w-3" />Out of Stock</>
                      )}
                    </button>
                    <div className="flex items-center gap-1">
                      <button onClick={() => handleAdjustStock(product, -1)} disabled={adjustingStock === product.id} className="w-5 h-5 bg-muted rounded flex items-center justify-center text-[10px] hover:bg-muted/80 disabled:opacity-50">-</button>
                      <span className="text-[10px] min-w-[20px] text-center">{product.stock}</span>
                      <button onClick={() => handleAdjustStock(product, 1)} disabled={adjustingStock === product.id} className="w-5 h-5 bg-muted rounded flex items-center justify-center text-[10px] hover:bg-muted/80 disabled:opacity-50">+</button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
