import React, { useState, useEffect, useMemo } from 'react';
import { db } from '../lib/firebase';
import { collection, onSnapshot, doc, setDoc, query, orderBy } from 'firebase/firestore';
import { Category, Product, Order, OrderItem } from '../types';
import { ShoppingCart, Search, X, MapPin, Phone, User, CheckCircle2, ChevronRight, Menu, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Storefront() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [cart, setCart] = useState<{ product: Product, qty: number }[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState<Order | null>(null);
  const [mobileMenu, setMobileMenu] = useState(false);

  useEffect(() => {
    onSnapshot(collection(db, 'categories'), snap => {
      setCategories(snap.docs.map(d => ({ ...d.data(), id: d.id } as Category)));
    });
    onSnapshot(collection(db, 'products'), snap => {
      setProducts(snap.docs.map(d => ({ ...d.data(), id: d.id } as Product)));
    });
  }, []);

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(i => i.product.id === product.id);
      if (existing) return prev.map(i => i.product.id === product.id ? { ...i, qty: i.qty + 1 } : i);
      return [...prev, { product, qty: 1 }];
    });
    // Toast logic can be added here
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(i => i.product.id !== id));
  };

  const cartTotal = cart.reduce((s, i) => {
    const price = i.product.price * (1 - i.product.disc / 100);
    return s + price * i.qty;
  }, 0);

  const filteredProducts = products.filter(p => 
    p.status === 'active' && 
    (filter === 'all' || p.cat === filter) &&
    (!search || p.name.includes(search) || p.desc.includes(search))
  );

  const submitOrder = async (orderData: any) => {
    const id = 'ORD-' + Math.random().toString(36).substr(2, 9).toUpperCase();
    const order: Order = {
      id,
      ...orderData,
      items: cart.map(i => ({ icon: i.product.icon, name: i.product.name, price: i.product.price * (1-i.product.disc/100), qty: i.qty })),
      total: cartTotal,
      status: 'new',
      date: new Date().toLocaleDateString('ar-IQ')
    };

    try {
      await setDoc(doc(db, 'orders', id), order);
      setCart([]);
      setShowOrderForm(false);
      setOrderSuccess(order);
    } catch (e) {
      alert('خطأ في إرسال الطلب');
    }
  };

  return (
    <div className="store-mode rtl min-h-screen bg-[#FFFAF9]">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#FDF0F3]/90 backdrop-blur-xl border-b border-[#F2C4CE] shadow-[0_2px_24px_rgba(201,168,76,0.18)]">
        <div className="max-w-[1320px] mx-auto px-6 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
             <div className="w-12 h-12 bg-white rounded-xl shadow-md overflow-hidden flex items-center justify-center p-1 border border-pink-100 italic font-black text-xl text-[#C9A84C]">ROS</div>
             <span className="logo-text font-display text-2xl font-black bg-gradient-to-r from-[#9A7A30] via-[#E8C97A] to-[#9A7A30] bg-clip-text text-transparent">ROS</span>
          </div>

          <nav className="hidden md:flex items-center gap-1">
            {categories.slice(0, 5).map(c => (
              <a key={c.id} href={`#${c.id}`} className="text-xs font-bold text-[#5C3A42] px-4 py-2 rounded-full hover:bg-[#C9A84C] hover:text-white transition-all">{c.name}</a>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <button onClick={() => setIsCartOpen(true)} className="header-cart bg-gradient-to-br from-[#C9A84C] to-[#9A7A30] text-white px-5 py-2.5 rounded-full font-bold text-sm shadow-lg flex items-center gap-2 hover:scale-105 transition-all">
              🛒 السلة <span className="bg-[#C47A8A] w-5 h-5 rounded-full flex items-center justify-center text-[0.65rem]">{cart.length}</span>
            </button>
            <button className="md:hidden text-[#9A7A30]" onClick={() => setMobileMenu(!mobileMenu)}><Menu /></button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="hero py-20 px-6 text-center space-y-6">
         <span className="inline-block bg-gradient-to-r from-[#C9A84C] to-[#E8C97A] text-white px-4 py-1 rounded-full text-xs font-bold shadow-sm">✨ متجر التصوير الاحترافي</span>
         <h1 className="font-display text-5xl md:text-7xl font-black leading-tight bg-gradient-to-r from-[#9A7A30] via-[#E8C97A] to-[#9A7A30] bg-clip-text text-transparent">كل ما تحتاجه<br/>للتصوير الاحترافي</h1>
         <p className="max-w-xl mx-auto text-[#5C3A42] text-lg leading-relaxed">اكتشف مجموعة متميزة من معدات التصوير الاحترافية — ستاندات، إضاءات، مايكات، وأكثر. جودة عالية بأسعار مناسبة.</p>
         <div className="flex flex-wrap justify-center gap-4 pt-4">
            <button className="bg-gradient-to-br from-[#C9A84C] to-[#9A7A30] text-white px-8 py-3.5 rounded-full font-bold shadow-xl hover:-translate-y-1 transition-all">تسوق الآن</button>
            <button onClick={() => setIsCartOpen(true)} className="border-2 border-[#C9A84C] text-[#9A7A30] px-8 py-3.5 rounded-full font-bold hover:bg-[#C9A84C] hover:text-white transition-all">عرض السلة 🛒</button>
         </div>
      </section>

      {/* Search & Filter */}
      <div className="max-w-2xl mx-auto px-6 -mt-8 relative z-10">
         <div className="relative group">
           <input 
            type="text" 
            placeholder="ابحث عن منتج..." 
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full h-14 pr-14 pl-6 bg-white border-2 border-[#F2C4CE] rounded-full shadow-lg outline-none focus:border-[#C9A84C] transition-all"
           />
           <Search className="absolute right-5 top-1/2 -translate-y-1/2 text-[#C9A84C]" size={22} />
         </div>
      </div>

      {/* Categories Grid */}
      <section className="max-w-[1320px] mx-auto px-6 py-16">
        <div className="flex flex-col items-center mb-10 text-center">
          <h2 className="font-display text-4xl font-black bg-gradient-to-r from-[#9A7A30] to-[#E8C97A] bg-clip-text text-transparent">أقسام المتجر</h2>
          <p className="text-[#5C3A42] mt-2">اختر القسم الذي يناسب احتياجاتك</p>
          <div className="w-16 h-1 bg-[#C9A84C] rounded-full mt-4"></div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
           <CategoryCard active={filter === 'all'} icon="🏪" name="جميع المنتجات" sub="كل الأقسام" onClick={() => setFilter('all')} />
           {categories.map(c => (
              <CategoryCard key={c.id} active={filter === c.id} icon={c.icon} name={c.name} sub={c.desc} onClick={() => setFilter(c.id)} />
           ))}
        </div>
      </section>

      {/* Products Grid */}
      <section className="max-w-[1320px] mx-auto px-6 pb-24">
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {filteredProducts.map(p => (
              <ProductCard key={p.id} product={p} onAdd={() => addToCart(p)} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 opacity-40">
             <Search size={60} className="mx-auto mb-4" />
             <p className="text-xl">لا توجد منتجات مطابقة للبحث</p>
          </div>
        )}
      </section>

      {/* Cart Sidebar */}
      <AnimatePresence>
        {isCartOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsCartOpen(false)} className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm" />
            <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 25, stiffness: 200 }} className="fixed inset-y-0 right-0 z-[101] w-full max-w-[400px] bg-white border-l-2 border-[#F2C4CE] shadow-2xl flex flex-col">
              <div className="p-6 border-b border-[#F2C4CE] flex items-center justify-between">
                <h3 className="font-display text-xl font-bold text-[#9A7A30]">🛒 سلة التسوق</h3>
                <button onClick={() => setIsCartOpen(false)} className="w-9 h-9 bg-[#FDF0F3] rounded-full flex items-center justify-center hover:bg-[#F2C4CE] transition-all"><X size={20} /></button>
              </div>
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {cart.length === 0 ? (
                  <div className="text-center py-20 opacity-30">
                    <div className="text-6xl mb-4">🛍️</div>
                    <p className="text-lg">سلتك فارغة</p>
                  </div>
                ) : (
                  cart.map((item, i) => (
                    <div key={i} className="bg-[#FDF0F3] rounded-2xl p-4 flex gap-4 items-center group">
                      <div className="w-16 h-16 bg-white rounded-xl flex items-center justify-center text-3xl shadow-sm overflow-hidden">
                        {item.product.media?.[0]?.url ? <img src={item.product.media[0].url} className="w-full h-full object-cover" /> : item.product.icon}
                      </div>
                      <div className="flex-1">
                        <div className="font-bold text-sm">{item.product.name} {item.qty > 1 && `×${item.qty}`}</div>
                        <div className="text-[#9A7A30] font-bold text-sm">{(item.product.price * (1-item.product.disc/100) * item.qty).toLocaleString()} د.ع</div>
                      </div>
                      <button onClick={() => removeFromCart(item.product.id)} className="w-8 h-8 rounded-full border border-pink-200 text-pink-300 hover:bg-pink-100 hover:text-pink-600 transition-all flex items-center justify-center">✕</button>
                    </div>
                  ))
                )}
              </div>
              <div className="p-6 border-t border-[#F2C4CE] space-y-4">
                <div className="flex justify-between items-center text-[#5C3A42]">
                  <span>الإجمالي المجموع</span>
                  <strong className="font-display text-2xl text-[#9A7A30]">{cartTotal.toLocaleString()} د.ع</strong>
                </div>
                <button 
                  onClick={() => { setIsCartOpen(false); setShowOrderForm(true); }}
                  disabled={cart.length === 0}
                  className="w-full bg-gradient-to-r from-[#C9A84C] to-[#9A7A30] text-white py-4 rounded-3xl font-bold shadow-lg hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
                 >إتمام الطلب →</button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Order Form */}
      <AnimatePresence>
        {showOrderForm && (
          <OrderFormModal total={cartTotal} onSubmit={submitOrder} onClose={() => setShowOrderForm(false)} />
        )}
      </AnimatePresence>

      {/* Success Modal */}
      <AnimatePresence>
        {orderSuccess && (
          <SuccessModal order={orderSuccess} onClose={() => setOrderSuccess(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}

function CategoryCard({ icon, name, sub, active, onClick }: any) {
  return (
    <div 
      onClick={onClick}
      className={`cat-card p-6 rounded-3xl text-center border-2 transition-all cursor-pointer ${active ? 'border-[#C9A84C] bg-amber-50 shadow-xl -translate-y-1' : 'border-[#F2C4CE] bg-white shadow-sm hover:-translate-y-1 hover:shadow-md'}`}
    >
      <div className="text-4xl mb-3">{icon}</div>
      <div className="font-bold text-sm text-[#5C3A42]">{name}</div>
      {sub && <div className="text-[0.7rem] text-gray-400 mt-1">{sub}</div>}
    </div>
  );
}

function ProductCard({ product, onAdd }: { product: Product; onAdd: () => void; key?: string }) {
  const finalPrice = product.price * (1 - product.disc / 100);
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="prod-card group bg-white rounded-3xl border-2 border-[#F2C4CE] overflow-hidden hover:border-[#C9A84C] hover:shadow-2xl hover:-translate-y-2 transition-all duration-300"
    >
      <div className="aspect-square bg-[#FDF0F3] relative flex items-center justify-center overflow-hidden">
        {product.badge && <span className="absolute top-3 right-3 bg-gradient-to-br from-[#C9A84C] to-[#9A7A30] text-white text-[0.65rem] font-bold px-3 py-1 rounded-full z-10 shadow-md">{product.badge}</span>}
        <div className="w-full h-full flex items-center justify-center text-6xl group-hover:scale-110 transition-transform duration-500">
           {product.media?.[0]?.url ? (
             product.media[0].type === 'video' ? <video src={product.media[0].url} className="w-full h-full object-cover" autoPlay muted loop playsInline /> : <img src={product.media[0].url} className="w-full h-full object-cover" />
           ) : product.icon}
        </div>
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-all" />
      </div>
      <div className="p-4 space-y-2">
         <div className="text-[0.65rem] text-[#C9A84C] font-black uppercase tracking-widest">قسم المميز</div>
         <h4 className="font-bold text-[#2C1A1E] text-sm leading-tight h-10 line-clamp-2">{product.name}</h4>
         <p className="text-[0.75rem] text-gray-400 line-clamp-1">{product.desc}</p>
         <div className="flex items-center justify-between pt-2">
            <div className="font-display font-black text-[#9A7A30]">
               <div className="text-lg leading-none">{finalPrice.toLocaleString()} <span className="text-[0.65rem] font-sans opacity-60">د.ع</span></div>
               {product.disc > 0 && <div className="text-[0.65rem] line-through text-gray-400 opacity-60 mt-0.5">{product.price.toLocaleString()}</div>}
            </div>
            <button onClick={onAdd} className="bg-gradient-to-r from-[#C9A84C] to-[#9A7A30] text-white p-2 rounded-2xl shadow-md hover:scale-110 active:scale-95 transition-all">
               <Plus size={20} />
            </button>
         </div>
      </div>
    </motion.div>
  );
}

function OrderFormModal({ total, onSubmit, onClose }: any) {
  const [formData, setFormData] = useState({ name: '', phone: '', gov: '', address: '', note: '' });
  const [errors, setErrors] = useState<any>({});

  const go = () => {
    const e: any = {};
    if (!formData.name) e.name = 'الاسم مطلوب';
    if (!formData.phone || !/^07\d{9}$/.test(formData.phone)) e.phone = 'رقم الهاتف يجب أن يكون 11 رقم يبدأ بـ 07';
    if (!formData.gov) e.gov = 'اختر المحافظة';
    if (!formData.address) e.address = 'العنوان مطلوب';
    
    setErrors(e);
    if (Object.keys(e).length === 0) onSubmit(formData);
  };

  const govs = ['بغداد','البصرة','نينوى','أربيل','النجف','كربلاء','الأنبار','ديالى','صلاح الدين','ذي قار','بابل','واسط','القادسية','المثنى','ميسان','السليمانية','دهوك','كركوك'];

  return (
    <div className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-md flex items-center justify-center p-4 rtl overflow-y-auto">
       <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white rounded-[2rem] w-full max-w-lg border-2 border-[#F2C4CE] shadow-2xl overflow-hidden my-auto">
          <div className="p-6 border-b border-[#F2C4CE] flex items-center justify-between bg-white sticky top-0 z-10">
             <div className="flex items-center gap-3">
                <span className="text-2xl">🛍️</span>
                <div>
                   <h2 className="font-display font-black text-xl text-[#9A7A30]">إتمام الطلب</h2>
                   <p className="text-[0.7rem] text-gray-400">يرجى تعبئة البيانات لإكمال طلبك</p>
                </div>
             </div>
             <button onClick={onClose} className="w-9 h-9 bg-pink-50 rounded-full flex items-center justify-center text-pink-300">✕</button>
          </div>

          <div className="p-6 space-y-4">
             <div className="space-y-1">
                <label className="text-xs font-bold text-[#5C3A42] flex items-center gap-2"><User size={14}/> الاسم الكامل <span className="text-red-500">*</span></label>
                <input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className={`w-full p-3 rounded-xl border-2 outline-none focus:border-[#C9A84C] transition-all ${errors.name ? 'border-red-400' : 'border-pink-50'}`} placeholder="اكتب اسمك هنا..." />
                {errors.name && <p className="text-[0.65rem] text-red-500 pr-2">⚠️ {errors.name}</p>}
             </div>
             <div className="space-y-1">
                <label className="text-xs font-bold text-[#5C3A42] flex items-center gap-2"><Phone size={14}/> رقم الهاتف <span className="text-red-500">*</span></label>
                <input value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} maxLength={11} className={`w-full p-3 rounded-xl border-2 outline-none focus:border-[#C9A84C] transition-all ${errors.phone ? 'border-red-400' : 'border-pink-50'}`} placeholder="07XXXXXXXXX" />
                {errors.phone && <p className="text-[0.65rem] text-red-500 pr-2">⚠️ {errors.phone}</p>}
             </div>
             <div className="space-y-1">
                <label className="text-xs font-bold text-[#5C3A42] flex items-center gap-2"><MapPin size={14}/> المحافظة <span className="text-red-500">*</span></label>
                <select value={formData.gov} onChange={e => setFormData({...formData, gov: e.target.value})} className={`w-full p-3 rounded-xl border-2 outline-none focus:border-[#C9A84C] transition-all ${errors.gov ? 'border-red-400' : 'border-pink-50'}`}>
                   <option value="">— اختر محافظتك —</option>
                   {govs.map(g => <option key={g} value={g}>{g}</option>)}
                </select>
             </div>
             <div className="space-y-1">
                <label className="text-xs font-bold text-[#5C3A42] flex items-center gap-2"><MapPin size={14}/> أقرب نقطة دالة / منطقة <span className="text-red-500">*</span></label>
                <input value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} className={`w-full p-3 rounded-xl border-2 outline-none focus:border-[#C9A84C] transition-all ${errors.address ? 'border-red-400' : 'border-pink-50'}`} placeholder="مثال: حي الجامعة، قرب مسجد النور..." />
             </div>
             <div>
                <label className="text-xs font-bold text-[#5C3A42] flex items-center gap-2">📝 ملاحظة (اختياري)</label>
                <textarea value={formData.note} onChange={e => setFormData({...formData, note: e.target.value})} className="w-full p-3 rounded-xl border-2 border-pink-50 outline-none focus:border-[#C9A84C]" placeholder="أي ملاحظة إضافية للطلب..."></textarea>
             </div>

             <div className="p-4 bg-gradient-to-r from-[#C9A84C] to-[#E8C97A] rounded-2xl flex justify-between items-center text-white">
                <span className="text-sm">المجموع الكلي</span>
                <strong className="font-display text-xl">{total.toLocaleString()} د.ع</strong>
             </div>

             <button onClick={go} className="w-full bg-gradient-to-r from-[#C9A84C] to-[#9A7A30] text-white py-4 rounded-2xl font-bold shadow-xl hover:scale-[1.02] active:scale-95 transition-all">تأكيد الطلب ✓</button>
          </div>
       </motion.div>
    </div>
  );
}

function SuccessModal({ order, onClose }: any) {
  return (
    <div className="fixed inset-0 z-[300] bg-black/70 backdrop-blur-lg flex items-center justify-center p-4 rtl">
       <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white rounded-[2.5rem] w-full max-w-sm p-10 text-center border-4 border-[#C9A84C]/20 shadow-2xl">
          <div className="text-7xl mb-6 scale-animation">🎉</div>
          <h2 className="font-display text-3xl font-black text-[#9A7A30] mb-2">تم استلام طلبك!</h2>
          <div className="text-sm text-gray-500 mb-8 leading-relaxed">
             طلبك رقم <strong>{order.id.slice(-6)}</strong> قيد التجهيز الآن.<br/>سيتم التواصل معك عبر الهاتف للتأكيد.
          </div>
          <button onClick={onClose} className="w-full bg-gradient-to-r from-[#C9A84C] to-[#9A7A30] text-white py-4 rounded-full font-bold shadow-xl hover:-translate-y-1 transition-all">حسناً ✓</button>
       </motion.div>
    </div>
  );
}
