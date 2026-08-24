"use client";

import { useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { MapPin, Store, Star, Search, ArrowLeft, Clock, Users, Phone, Loader2, Package, ShoppingBag, ChevronRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useLocation, useShops, useProducts, useChats, createChat, sendMessage, type ProductData } from "@/hooks/useApi";
import { useAuthStore } from "@/store/authStore";
import { useDealStore } from "@/store/dealStore";
import VerifiedBadge from "@/components/VerifiedBadge";
import ProductDetailModal from "@/components/ProductDetailModal";
import DealModal from "@/components/DealModal";
import DealSuccessPopup from "@/components/DealSuccessPopup";

export default function LocationDetailPage() {
  const { locationId } = useParams<{ locationId: string }>();
  const router = useRouter();
  const { user } = useAuthStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedShop, setSelectedShop] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<ProductData | null>(null);
  const [dealProduct, setDealProduct] = useState<ProductData | null>(null);
  const [showDealModal, setShowDealModal] = useState(false);
  const [dealSending, setDealSending] = useState(false);
  const [dealSuccess, setDealSuccess] = useState<{ productName: string; quantity: number; totalPrice: number; chatId: string } | null>(null);
  const dealCount = useDealStore((s) => s.dealCount);
  const incrementDealCount = useDealStore((s) => s.incrementDealCount);

  const { data: locData, loading: locLoading } = useLocation(locationId);
  const { data: shopsData, loading: shopsLoading } = useShops({ locationId: locationId || undefined });
  const { data: productsData } = useProducts(selectedShop ? { shopId: selectedShop } : undefined);

  const location = locData?.location;
  const allShops = shopsData?.shops || [];
  const categories = ["all", ...Array.from(new Set(allShops.map((s) => s.specialties?.[0] || "General")))];
  const filtered = allShops.filter((s) => {
    const matchSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchCat = selectedCategory === "all" || s.specialties?.includes(selectedCategory);
    return matchSearch && matchCat;
  });

  const shopProducts = productsData?.products || [];
  const loading = locLoading || shopsLoading;

  // Find shop name for the selected shop
  const currentShop = allShops.find((s) => s.id === selectedShop);

  const handleProductClick = (product: ProductData) => {
    setSelectedProduct(product);
  };

  const handleMakeDealFromProduct = (product: ProductData) => {
    setSelectedProduct(null); // Close product detail
    setDealProduct(product); // Store for deal modal
    setShowDealModal(true); // Open deal modal
  };

  const handleDealSend = useCallback(async (data: { quantity: number; suggestedPrice: number; message: string }) => {
    if (!dealProduct || !user || !currentShop) return;
    setDealSending(true);

    try {
      const ownerId = typeof currentShop.ownerId === "string" ? currentShop.ownerId : (currentShop.ownerId as { id: string }).id;
      const chatsRes = await fetch(`/api/chat?userId=${user.id}`);
      const chatsJson = await chatsRes.json();
      const existingChat = (chatsJson.chats || []).find(
        (c: { otherParticipant?: { id: string } }) => c.otherParticipant?.id === ownerId
      );

      let chatId: string;
      if (existingChat) {
        chatId = existingChat.id;
      } else {
        const createRes = await createChat({
          type: "deal",
          participants: [user.id, ownerId],
          dealInfo: {
            productName: dealProduct.name,
            initialPrice: data.suggestedPrice,
            status: "pending",
          },
        });
        chatId = createRes.chat.id;
      }

      const senderName = `${user.firstName} ${user.lastName}`;
      await sendMessage({
        chatId,
        senderId: user.id,
        senderName,
        senderRole: "customer",
        content: data.message,
        type: "text",
      });

      setShowDealModal(false);
      incrementDealCount();
      setDealSuccess({
        productName: dealProduct.name,
        quantity: data.quantity,
        totalPrice: data.quantity * data.suggestedPrice,
        chatId,
      });
      setDealProduct(null);
    } catch (e) {
      console.error("Failed to create deal:", e);
    } finally {
      setDealSending(false);
    }
  }, [dealProduct, user, currentShop, incrementDealCount]);

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 bg-background/90 backdrop-blur-lg border-b border-border">
        <div className="flex items-center justify-between px-4 h-14">
          <Button variant="ghost" size="sm" onClick={() => selectedShop ? setSelectedShop(null) : router.back()}>
            <ArrowLeft className="h-4 w-4 mr-1" />{selectedShop ? "Back to shops" : "Back"}
          </Button>
          <h1 className="text-sm font-bold truncate">{selectedShop ? currentShop?.name || "Shop" : location?.name || "Location"}</h1>
          <div className="w-16 flex justify-end">
            {dealCount > 0 && (
              <div className="flex items-center gap-1 bg-primary/10 px-2 py-0.5 rounded-full">
                <ShoppingBag className="h-3 w-3 text-primary" />
                <span className="text-[10px] font-bold text-primary">{dealCount}</span>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="px-4 py-4 space-y-4 max-w-5xl mx-auto">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : (
          <>
            {/* Location Info */}
            {location && !selectedShop && (
              <Card className="bg-card border-border overflow-hidden">
                <CardContent className="p-4 sm:p-5">
                  <h1 className="text-xl font-bold mb-2">{location.name}</h1>
                  <p className="text-sm text-muted-foreground mb-3">{location.description}</p>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {(location.specialties || []).map((s) => (
                      <Badge key={s} variant="secondary" className="text-xs">{s}</Badge>
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1"><Star className="h-3 w-3 text-yellow-400 fill-yellow-400" />{location.rating}</div>
                    <div className="flex items-center gap-1"><Store className="h-3 w-3" />{allShops.length} shops</div>
                    <div className="flex items-center gap-1"><Users className="h-3 w-3" />{location.userCount} users</div>
                    {location.hours && <div className="flex items-center gap-1"><Clock className="h-3 w-3" />{location.hours}</div>}
                    {location.contact && <div className="flex items-center gap-1"><Phone className="h-3 w-3" />{location.contact}</div>}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Shop Products (Virtual Browse) */}
            {selectedShop && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold flex items-center gap-1.5">
                    <Package className="h-4 w-4 text-primary" />
                    Products ({shopProducts.length})
                  </h3>
                </div>

                {shopProducts.length === 0 ? (
                  <div className="text-center py-8">
                    <Package className="h-8 w-8 text-muted-foreground mx-auto mb-2 opacity-50" />
                    <p className="text-xs text-muted-foreground">No products listed yet</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {shopProducts.map((product) => (
                      <Card
                        key={product.id}
                        className="bg-card border-border hover:border-primary/30 transition-all duration-200 cursor-pointer active:scale-[0.98]"
                        onClick={() => handleProductClick(product)}
                      >
                        <CardContent className="p-3">
                          {/* Product image or placeholder */}
                          <div className="h-24 bg-muted rounded-lg flex items-center justify-center mb-2 overflow-hidden relative">
                            {product.images && product.images.length > 0 ? (
                              <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
                            ) : (
                              <ShoppingBag className="h-6 w-6 text-muted-foreground" />
                            )}
                            {product.discount && product.discount > 0 && (
                              <div className="absolute top-1 right-1">
                                <Badge className="bg-rose-500 text-white text-[9px] px-1 h-4 border-0">
                                  -{product.discount}%
                                </Badge>
                              </div>
                            )}
                          </div>
                          <h4 className="font-medium text-xs truncate mb-0.5">{product.name}</h4>
                          <p className="text-[10px] text-muted-foreground truncate mb-1.5">{product.description}</p>
                          <div className="flex items-center gap-1.5">
                            <span className="text-sm font-bold text-primary">K{product.price.toLocaleString()}</span>
                            {product.originalPrice && (
                              <span className="text-[10px] text-muted-foreground line-through">K{product.originalPrice.toLocaleString()}</span>
                            )}
                          </div>
                          <div className="flex items-center justify-between mt-1">
                            <div className="flex items-center gap-1">
                              <Star className="h-2.5 w-2.5 text-yellow-400 fill-yellow-400" />
                              <span className="text-[10px]">{product.rating} ({product.reviews})</span>
                            </div>
                            <span className="text-[10px] text-muted-foreground">{product.stock} in stock</span>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Search + Category Filter */}
            {!selectedShop && (
              <>
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                    <Input placeholder="Search shops..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
                  </div>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="px-3 py-2 bg-muted border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    {categories.map((c) => (
                      <option key={c} value={c}>{c === "all" ? "All Categories" : c}</option>
                    ))}
                  </select>
                </div>

                {/* Shops Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {filtered.map((shop) => (
                    <Card
                      key={shop.id}
                      className="bg-card border-border hover:border-primary/20 transition-colors cursor-pointer"
                      onClick={() => setSelectedShop(shop.id)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-1.5">
                            <h3 className="font-semibold text-sm">{shop.name}</h3>
                            {shop.status === "verified" && <VerifiedBadge size="sm" />}
                          </div>
                          <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <p className="text-xs text-muted-foreground mb-2 line-clamp-2">{shop.description}</p>
                        <div className="flex flex-wrap gap-1 mb-3">
                          {(shop.specialties || []).slice(0, 3).map((s) => (
                            <Badge key={s} variant="outline" className="text-[10px]">{s}</Badge>
                          ))}
                        </div>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
                          <div className="flex items-center gap-1">
                            <Star className="h-3 w-3 text-yellow-400 fill-yellow-400" />
                            {shop.rating || "—"} ({shop.totalReviews})
                          </div>
                          <span>{shop.productCount || 0} products</span>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          className="w-full h-7 text-[11px]"
                          onClick={(e) => { e.stopPropagation(); setSelectedShop(shop.id); }}
                        >
                          <Package className="h-3 w-3 mr-1" />Browse Products
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {filtered.length === 0 && (
                  <div className="text-center py-12">
                    <Store className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                    <p className="text-sm font-medium">No shops found</p>
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>

      {/* Product Detail Modal */}
      {selectedProduct && (
        <ProductDetailModal
          isOpen={!!selectedProduct}
          onClose={() => setSelectedProduct(null)}
          product={selectedProduct}
          shopName={currentShop?.name}
          onMakeDeal={handleMakeDealFromProduct}
        />
      )}

      {/* Deal Modal */}
      <DealModal
        isOpen={showDealModal}
        onClose={() => { setShowDealModal(false); setDealProduct(null); }}
        productName={dealProduct?.name || ""}
        productPrice={dealProduct?.price}
        shopName={currentShop?.name}
        onSendDeal={handleDealSend}
        sending={dealSending}
      />

      {/* Deal Success Popup */}
      <DealSuccessPopup
        isOpen={!!dealSuccess}
        onClose={() => setDealSuccess(null)}
        productName={dealSuccess?.productName || ""}
        quantity={dealSuccess?.quantity || 0}
        totalPrice={dealSuccess?.totalPrice || 0}
        onGoToChat={() => {
          if (dealSuccess?.chatId) {
            router.push(`/customer/chat?chatId=${dealSuccess.chatId}`);
          }
          setDealSuccess(null);
        }}
        onContinueBrowsing={() => setDealSuccess(null)}
      />
    </div>
  );
}
