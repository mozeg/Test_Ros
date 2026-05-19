import React, { useState, useEffect } from 'react';
import { db, auth } from '../lib/firebase';
import { collection, onSnapshot, doc, setDoc, deleteDoc, updateDoc, query, orderBy } from 'firebase/firestore';
import { Category, Product, Discount, Order } from '../types';
import { LayoutDashboard, FolderTree, Package, Tag, ShoppingCart, BarChart3, Store, LogOut, Trash2, Edit3, Plus, X, Search, CheckCircle2, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AdminPanel({ onLogout }: { onLogout: () => void }) {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [showCatModal, setShowCatModal] = useState(false);
  const [showProdModal, setShowProdModal] = useState(false);
  const [showDiscModal, setShowDiscModal] = useState(false);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<{ id: string, type: 'cat' | 'prod' | 'disc', title: string } | null>(null);

  // Edit states
  const [editingCat, setEditingCat] = useState<Category | null>(null);
  const [editingProd, setEditingProd] = useState<Product | null>(null);
  const [editingDisc, setEditingDisc] = useState<Discount | null>(null);
  const [viewingOrder, setViewingOrder] = useState<Order | null>(null);

  useEffect(() => {
    const unsubCats = onSnapshot(collection(db, 'categories'), (snap) => {
      setCategories(snap.docs.map(d => ({ ...d.data(), id: d.id } as Category)));
    });
    const unsubProds = onSnapshot(collection(db, 'products'), (snap) => {
      setProducts(snap.docs.map(d => ({ ...d.data(), id: d.id } as Product)));
    });
    const unsubDiscs = onSnapshot(collection(db, 'discounts'), (snap) => {
      setDiscounts(snap.docs.map(d => ({ ...d.data(), id: d.id } as Discount)));
    });
    const unsubOrds = onSnapshot(query(collection(db, 'orders'), orderBy('date', 'desc')), (snap) => {
      setOrders(snap.docs.map(d => ({ ...d.data(), id: d.id } as Order)));
      setLoading(false);
    });

    return () => {
      unsubCats(); unsubProds(); unsubDiscs(); unsubOrds();
    };
  }, []);

  const handleDelete = async () => {
    if (!confirmDelete) return;
    try {
      const collectionName = confirmDelete.type === 'cat' ? 'categories' : confirmDelete.type === 'prod' ? 'products' : 'discounts';
      await deleteDoc(doc(db, collectionName, confirmDelete.id));
      setConfirmDelete(null);
    } catch (err) {
      console.error("Error deleting document:", err);
    }
  };

  if (loading) return <div className="flex items-center justify-center h-screen bg-[#0F0A0C] text-white">جاري التحميل...</div>;

  return (
    <div className="admin-mode flex min-h-screen bg-[#0F0A0C] text-[#F5EEF0] rtl">
      {/* Sidebar */}
      <aside className="sb w-[250px] bg-[#1A1015] border-l border-[#3A2530] flex flex-col fixed inset-y-0 right-0 z-50">
        <div className="sb-logo p-5 border-b border-[#3A2530]">
          <div className="sb-logo-t text-2xl font-black italic bg-gradient-to-br from-[#9A7A30] to-[#E8C97A] bg-clip-text text-transparent">ROS</div>
          <div className="sb-sub text-[0.66rem] text-[#B09098]">لوحة التحكم الإدارية</div>
        </div>
        <nav className="sb-nav flex-1 p-3 flex flex-col gap-1 overflow-y-auto">
          <div className="sb-sec text-[0.66rem] text-[#B09098] px-3 py-2 uppercase tracking-widest">الرئيسية</div>
          <button onClick={() => setActiveTab('dashboard')} className={`sb-btn flex items-center gap-3 p-3 rounded-xl transition-all ${activeTab === 'dashboard' ? 'bg-gradient-to-br from-[#c9a84c2b] to-[#c9a84c0f] text-[#E8C97A] border border-[#c9a84c38]' : 'text-[#B09098] hover:bg-[#251A1F]'}`}>
            <LayoutDashboard size={18} /> لوحة المعلومات
          </button>
          
          <div className="sb-sec text-[0.66rem] text-[#B09098] px-3 py-2 uppercase tracking-widest mt-4">إدارة المتجر</div>
          <button onClick={() => setActiveTab('categories')} className={`sb-btn flex items-center gap-3 p-3 rounded-xl transition-all ${activeTab === 'categories' ? 'bg-gradient-to-br from-[#c9a84c2b] to-[#c9a84c0f] text-[#E8C97A] border border-[#c9a84c38]' : 'text-[#B09098] hover:bg-[#251A1F]'}`}>
            <FolderTree size={18} /> الأقسام
          </button>
          <button onClick={() => setActiveTab('products')} className={`sb-btn flex items-center gap-3 p-3 rounded-xl transition-all ${activeTab === 'products' ? 'bg-gradient-to-br from-[#c9a84c2b] to-[#c9a84c0f] text-[#E8C97A] border border-[#c9a84c38]' : 'text-[#B09098] hover:bg-[#251A1F]'}`}>
            <Package size={18} /> المنتجات
          </button>
          <button onClick={() => setActiveTab('discounts')} className={`sb-btn flex items-center gap-3 p-3 rounded-xl transition-all ${activeTab === 'discounts' ? 'bg-gradient-to-br from-[#c9a84c2b] to-[#c9a84c0f] text-[#E8C97A] border border-[#c9a84c38]' : 'text-[#B09098] hover:bg-[#251A1F]'}`}>
            <Tag size={18} /> الخصومات
          </button>
          
          <div className="sb-sec text-[0.66rem] text-[#B09098] px-3 py-2 uppercase tracking-widest mt-4">الطلبات والزبائن</div>
          <button onClick={() => setActiveTab('orders')} className={`sb-btn flex items-center gap-3 p-3 rounded-xl transition-all relative ${activeTab === 'orders' ? 'bg-gradient-to-br from-[#c9a84c2b] to-[#c9a84c0f] text-[#E8C97A] border border-[#c9a84c38]' : 'text-[#B09098] hover:bg-[#251A1F]'}`}>
            <ShoppingCart size={18} /> طلبات الزبائن
            {orders.filter(o => o.status === 'new').length > 0 && (
              <span className="absolute left-3 bg-[#E05555] text-white text-[0.6rem] px-1.5 py-0.5 rounded-lg font-bold">
                {orders.filter(o => o.status === 'new').length}
              </span>
            )}
          </button>
          <button onClick={() => setActiveTab('analytics')} className={`sb-btn flex items-center gap-3 p-3 rounded-xl transition-all ${activeTab === 'analytics' ? 'bg-gradient-to-br from-[#c9a84c2b] to-[#c9a84c0f] text-[#E8C97A] border border-[#c9a84c38]' : 'text-[#B09098] hover:bg-[#251A1F]'}`}>
            <BarChart3 size={18} /> التحليلات
          </button>
        </nav>
        <div className="sb-foot p-3 border-t border-[#3A2530]">
          <a href="/" target="_blank" className="flex items-center justify-center gap-2 bg-gradient-to-br from-[#C9A84C] to-[#9A7A30] text-white rounded-xl py-2.5 font-bold text-sm hover:opacity-90 transition-opacity">
            <Store size={18} /> عرض المتجر
          </a>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main flex-1 mr-[250px] flex flex-col min-h-screen">
        <header className="topbar h-16 sticky top-0 z-40 bg-[rgba(15,10,12,0.92)] backdrop-blur-xl border-b border-[#3A2530] px-6 flex items-center justify-between">
          <h1 className="text-[#E8C97A] font-black text-lg">
            {activeTab === 'dashboard' ? 'لوحة المعلومات' : 
             activeTab === 'categories' ? 'إدارة الأقسام' :
             activeTab === 'products' ? 'إدارة المنتجات' :
             activeTab === 'discounts' ? 'الخصومات والكوبونات' :
             activeTab === 'orders' ? 'طلبات الزبائن' : 'التحليلات'}
          </h1>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-xs text-[#B09098]">
              <span className="w-2 h-2 rounded-full bg-[#4CAF50] shadow-[0_0_6px_#4CAF50]"></span>
              مزامنة فورية
            </div>
            <button onClick={onLogout} className="bg-[#251A1F] border border-[#3A2530] text-[#B09098] px-3 py-1.5 rounded-lg text-sm hover:border-[#C9A84C] hover:text-[#E8C97A] transition-all flex items-center gap-2">
              <LogOut size={16} /> خروج
            </button>
          </div>
        </header>

        <section className="content p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === 'dashboard' && <DashboardView categories={categories} products={products} orders={orders} />}
              {activeTab === 'categories' && <CategoriesView categories={categories} products={products} onEdit={(c) => { setEditingCat(c); setShowCatModal(true); }} onDelete={(c) => setConfirmDelete({ id: c.id, type: 'cat', title: c.name })} onAdd={() => { setEditingCat(null); setShowCatModal(true); }} />}
              {activeTab === 'products' && <ProductsView products={products} categories={categories} onEdit={(p) => { setEditingProd(p); setShowProdModal(true); }} onDelete={(p) => setConfirmDelete({ id: p.id, type: 'prod', title: p.name })} onAdd={() => { setEditingProd(null); setShowProdModal(true); }} />}
              {activeTab === 'discounts' && <DiscountsView discounts={discounts} onEdit={(d) => { setEditingDisc(d); setShowDiscModal(true); }} onDelete={(d) => setConfirmDelete({ id: d.id, type: 'disc', title: d.code })} onAdd={() => { setEditingDisc(null); setShowDiscModal(true); }} />}
              {activeTab === 'orders' && <OrdersView orders={orders} onView={(o) => { setViewingOrder(o); setShowOrderModal(true); }} />}
              {activeTab === 'analytics' && <AnalyticsView categories={categories} products={products} orders={orders} />}
            </motion.div>
          </AnimatePresence>
        </section>
      </main>

      {/* Modals */}
      {showCatModal && <CategoryModal category={editingCat} onClose={() => setShowCatModal(false)} />}
      {showProdModal && <ProductModal product={editingProd} categories={categories} onClose={() => setShowProdModal(false)} />}
      {showDiscModal && <DiscountModal discount={editingDisc} onClose={() => setShowDiscModal(false)} />}
      {showOrderModal && viewingOrder && <OrderDetailModal order={viewingOrder} onClose={() => setShowOrderModal(false)} />}
      
      {/* Confirm Delete Dialog */}
      {confirmDelete && (
        <div className="fixed inset-0 z-[1000] bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 rtl">
          <div className="bg-[#1E1318] border border-[#3A2530] rounded-2xl p-8 max-w-sm w-full text-center shadow-2xl">
            <div className="text-4xl mb-3">🗑️</div>
            <h3 className="text-[#E8C97A] font-bold text-xl mb-2">تأكيد الحذف</h3>
            <p className="text-[#B09098] text-sm mb-6 leading-relaxed">
              هل أنت متأكد من حذف «{confirmDelete.title}»؟ لا يمكن التراجع عن هذا الإجراء.
            </p>
            <div className="flex gap-3 justify-center">
              <button onClick={() => setConfirmDelete(null)} className="px-6 py-2 rounded-lg border border-[#3A2530] text-[#B09098] hover:border-[#C9A84C] hover:text-[#E8C97A] transition-all text-sm">إلغاء</button>
              <button onClick={handleDelete} className="px-6 py-2 rounded-lg bg-gradient-to-br from-[#E05555] to-[#C03333] text-white font-bold text-sm shadow-lg">حذف ✓</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SUB-VIEWS
// ─────────────────────────────────────────────────────────────────────────────

function DashboardView({ categories, products, orders }: { categories: any[], products: any[], orders: any[] }) {
  const totalSales = orders.reduce((s, o) => s + o.total, 0);
  const newOrdersCount = orders.filter(o => o.status === 'new').length;
  const activeProdsCount = products.filter(p => p.status === 'active').length;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
        <StatCard icon="🛒" val={orders.length} label="إجمالي الطلبات" sub={`▲ ${newOrdersCount} جديد`} />
        <StatCard icon="💰" val={`${(totalSales / 1000).toFixed(0)}K`} label="المبيعات (د.ع)" sub="▲ ممتاز" />
        <StatCard icon="📦" val={activeProdsCount} label="منتجات نشطة" />
        <StatCard icon="✅" val={orders.filter(o => o.status === 'done').length} label="طلبات مكتملة" />
        <StatCard icon="🚚" val={orders.filter(o => o.status === 'shipped').length} label="قيد الشحن" />
        <StatCard icon="📁" val={categories.length} label="عدد الأقسام" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="bg-[#1E1318] border border-[#3A2530] rounded-2xl p-4">
          <h3 className="text-sm font-bold text-[#B09098] mb-4">📦 المنتجات الأكثر طلباً</h3>
          <div className="space-y-3">
            {[...products].sort((a,b) => (b.orders||0) - (a.orders||0)).slice(0, 5).map((p, i) => (
              <div key={p.id} className="flex items-center gap-3">
                <div className="w-20 text-[0.7rem] text-[#B09098] truncate">{p.name}</div>
                <div className="flex-1 h-2 bg-[#1A1015] rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-[#9A7A30] to-[#E8C97A]" style={{ width: `${Math.min(100, (p.orders / (Math.max(...products.map(x=>x.orders)) || 1)) * 100)}%` }}></div>
                </div>
                <div className="text-[0.7rem] font-bold text-[#E8C97A]">{p.orders || 0}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-[#1E1318] border border-[#3A2530] rounded-2xl p-4">
          <h3 className="text-sm font-bold text-[#B09098] mb-4">📋 آخر الطلبات</h3>
          <div className="space-y-2">
            {orders.slice(0, 5).map(o => (
              <div key={o.id} className="flex items-center justify-between py-2 border-b border-[#3A2530] last:border-0">
                <div>
                  <div className="text-sm font-bold truncate max-w-[120px]">{o.name}</div>
                  <div className="text-[0.7rem] text-[#B09098]">{o.gov} · {o.date}</div>
                </div>
                <div className="text-left">
                  <div className="text-xs font-bold text-[#E8C97A]">{o.total.toLocaleString()} د.ع</div>
                  <span className={`text-[0.6rem] px-2 py-0.5 rounded-lg ${o.status === 'new' ? 'bg-blue-500/20 text-blue-400' : o.status === 'done' ? 'bg-green-500/20 text-green-400' : 'bg-orange-500/20 text-orange-400'}`}>
                    {o.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, val, label, sub }: any) {
  return (
    <div className="sc">
      <div className="text-3xl mb-2">{icon}</div>
      <div className="text-2xl font-black text-[#E8C97A]">{val}</div>
      <div className="text-[0.78rem] text-[#B09098] mt-1">{label}</div>
      {sub && <div className="text-[0.7rem] text-[#4CAF50] mt-1">{sub}</div>}
    </div>
  );
}

function CategoriesView({ categories, products, onEdit, onDelete, onAdd }: any) {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-[#E8C97A] font-bold">📂 إدارة الأقسام</h3>
        <button onClick={onAdd} className="btn-g">+ إضافة قسم</button>
      </div>
      <div className="tbl-wrap">
        <table className="min-w-full">
          <thead>
            <tr>
              <th>صورة</th>
              <th>الاسم</th>
              <th>الوصف</th>
              <th>المنتجات</th>
              <th>الحالة</th>
              <th>إجراءات</th>
            </tr>
          </thead>
          <tbody>
            {categories.map(c => (
              <tr key={c.id}>
                <td>{c.img ? <img src={c.img} className="w-10 h-10 object-cover rounded-lg border border-[#3A2530]" /> : <div className="w-10 h-10 flex items-center justify-center bg-[#251A1F] rounded-lg text-lg border border-[#3A2530]">{c.icon}</div>}</td>
                <td className="font-bold">{c.name}</td>
                <td className="text-[#B09098] text-xs max-w-[200px] truncate">{c.desc}</td>
                <td><span className="bdg bg-b">{products.filter((p: any) => p.cat === c.id).length} منتج</span></td>
                <td><span className={`bdg ${c.status === 'active' ? 'bg-g' : 'bg-r'}`}>{c.status === 'active' ? 'نشط' : 'مخفي'}</span></td>
                <td>
                  <div className="flex gap-2">
                    <button onClick={() => onEdit(c)} className="border border-[#3A2530] px-3 py-1 rounded-lg text-xs hover:border-[#C9A84C] hover:text-[#E8C97A]"><Edit3 size={12} className="inline ml-1" /> تعديل</button>
                    <button onClick={() => onDelete(c)} className="bg-red-500/10 text-red-500 px-3 py-1 rounded-lg text-xs hover:bg-red-500 hover:text-white transition-all"><Trash2 size={12} className="inline ml-1" /> حذف</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ProductsView({ products, categories, onEdit, onDelete, onAdd }: any) {
  const [filter, setFilter] = useState('');
  const [search, setSearch] = useState('');

  const filtered = products.filter((p: any) => 
    (!filter || p.cat === filter) && 
    (!search || p.name.includes(search))
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap justify-between items-center gap-4">
        <h3 className="text-[#E8C97A] font-bold">📦 إدارة المنتجات</h3>
        <div className="flex flex-wrap items-center gap-3">
          <select value={filter} onChange={e => setFilter(e.target.value)} className="bg-[#251A1F] border border-[#3A2530] text-[#B09098] px-3 py-1.5 rounded-lg text-sm outline-none focus:border-[#C9A84C]">
            <option value="">كل الأقسام</option>
            {categories.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <div className="relative">
            <input type="text" placeholder="بحث..." value={search} onChange={e => setSearch(e.target.value)} className="bg-[#251A1F] border border-[#3A2530] text-[#B09098] pl-10 pr-3 py-1.5 rounded-lg text-sm outline-none focus:border-[#C9A84C]" />
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#B09098]" />
          </div>
          <button onClick={onAdd} className="btn-g">+ إضافة منتج</button>
        </div>
      </div>
      <div className="tbl-wrap">
        <table>
          <thead>
            <tr>
              <th>صورة</th>
              <th>المنتج</th>
              <th>القسم</th>
              <th>السعر</th>
              <th>خصم</th>
              <th>الحالة</th>
              <th>طلبات</th>
              <th>إجراءات</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((p: any) => (
              <tr key={p.id}>
                <td>
                  {p.media?.[0]?.url ? (
                    p.media[0].type === 'video' ? <video src={p.media[0].url} className="w-10 h-10 object-cover rounded-lg" muted /> : <img src={p.media[0].url} className="w-10 h-10 object-cover rounded-lg" />
                  ) : <div className="w-10 h-10 flex items-center justify-center bg-[#251A1F] rounded-lg text-lg">{p.icon}</div>}
                </td>
                <td>
                  <div className="font-bold text-sm">{p.name}</div>
                  {p.badge && <span className="text-[0.6rem] bg-orange-500/20 text-orange-400 px-1 rounded">{p.badge}</span>}
                </td>
                <td><span className="text-xs text-[#B09098]">{categories.find((c: any) => c.id === p.cat)?.name || 'غير معروف'}</span></td>
                <td><span className="text-[#E8C97A] font-bold">{p.price.toLocaleString()} د.ع</span></td>
                <td>{p.disc > 0 ? <span className="bg-orange-500/20 text-orange-400 text-[0.6rem] px-1 rounded">-{p.disc}%</span> : '—'}</td>
                <td><span className={`bdg ${p.status === 'active' ? 'bg-g' : 'bg-r'}`}>{p.status === 'active' ? 'نشط' : 'مخفي'}</span></td>
                <td><span className="bdg bg-gd">{p.orders || 0}</span></td>
                <td>
                  <div className="flex gap-2">
                    <button onClick={() => onEdit(p)} className="p-1.5 rounded-lg border border-[#3A2530] hover:border-[#C9A84C] text-[#B09098] hover:text-[#E8C97A]"><Edit3 size={14} /></button>
                    <button onClick={() => onDelete(p)} className="p-1.5 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all"><Trash2 size={14} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function DiscountsView({ discounts, onEdit, onDelete, onAdd }: any) {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-[#E8C97A] font-bold">🏷️ الخصومات والكوبونات</h3>
        <button onClick={onAdd} className="btn-g">+ إضافة خصم</button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {discounts.map(d => (
          <div key={d.id} className="bg-[#1E1318] border border-[#3A2530] rounded-2xl p-5 flex items-center justify-between hover:border-[#C9A84C] transition-all group">
            <div className="flex items-center gap-4">
              <div className="text-xl font-mono font-bold bg-[#c9a84c1f] text-[#E8C97A] px-4 py-2 rounded-xl tracking-widest">{d.code}</div>
              <div>
                <div className="font-bold text-[#F5EEF0]">{d.type === 'percent' ? `خصم ${d.value}%` : `خصم ${d.value.toLocaleString()} د.ع`}</div>
                <div className="text-xs text-[#B09098] mt-1">{d.note} · استُخدم {d.used}/{d.maxUse || '∞'}</div>
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => onEdit(d)} className="p-2 rounded-lg border border-[#3A2530] text-[#B09098] hover:text-[#E8C97A]"><Edit3 size={16} /></button>
              <button onClick={() => onDelete(d)} className="p-2 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white"><Trash2 size={16} /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function OrdersView({ orders, onView }: any) {
  const [statusFilter, setStatusFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = orders.filter((o: any) => 
    (!statusFilter || o.status === statusFilter) &&
    (!searchTerm || o.name.includes(searchTerm) || o.phone.includes(searchTerm))
  );

  const statusLabels: any = { new: 'جديد', processing: 'معالجة', shipped: 'شحن', done: 'مكتمل', cancelled: 'ملغي' };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap justify-between items-center gap-4">
        <h3 className="text-[#E8C97A] font-bold">🛒 طلبات الزبائن</h3>
        <div className="flex items-center gap-3">
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="bg-[#251A1F] border border-[#3A2530] text-[#B09098] px-3 py-1.5 rounded-lg text-sm outline-none">
            <option value="">كل الحالات</option>
            {Object.entries(statusLabels).map(([v, l]: any) => <option key={v} value={v}>{l}</option>)}
          </select>
          <input type="text" placeholder="بحث..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="bg-[#251A1F] border border-[#3A2530] text-[#B09098] px-3 py-1.5 rounded-lg text-sm outline-none" />
        </div>
      </div>
      <div className="tbl-wrap">
        <table>
          <thead>
            <tr>
              <th>رقم الطلب</th>
              <th>الزبون</th>
              <th>المحافظة</th>
              <th>المجموع</th>
              <th>الحالة</th>
              <th>التاريخ</th>
              <th>إجراءات</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((o: any) => (
              <tr key={o.id}>
                <td className="text-[0.7rem] text-[#B09098] font-mono">{o.id.slice(-6)}</td>
                <td>
                  <div className="font-bold text-sm">{o.name}</div>
                  <div className="text-[0.65rem] text-[#B09098]">{o.phone}</div>
                </td>
                <td><span className="bdg bg-b">{o.gov}</span></td>
                <td><span className="text-[#E8C97A] font-bold">{o.total.toLocaleString()} د.ع</span></td>
                <td>
                  <select 
                    value={o.status} 
                    onChange={async (e) => await updateDoc(doc(db, 'orders', o.id), { status: e.target.value })}
                    className="bg-[#1A1015] text-xs p-1 rounded border border-[#3A2530]"
                  >
                     {Object.entries(statusLabels).map(([v, l]: any) => <option key={v} value={v}>{l}</option>)}
                  </select>
                </td>
                <td className="text-[0.7rem] text-[#B09098]">{o.date}</td>
                <td><button onClick={() => onView(o)} className="p-1.5 bg-blue-500/10 text-blue-400 rounded-lg"><ShoppingCart size={14} /></button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function AnalyticsView({ categories, products, orders }: any) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
         <div className="bg-[#1E1318] border border-[#3A2530] p-6 rounded-2xl text-center">
            <div className="text-3xl mb-2">📊</div>
            <div className="text-2xl font-black text-[#E8C97A]">{orders.length}</div>
            <div className="text-xs text-[#B09098] uppercase tracking-widest mt-2">إجمالي الطلبات</div>
         </div>
         <div className="bg-[#1E1318] border border-[#3A2530] p-6 rounded-2xl text-center">
            <div className="text-3xl mb-2">💰</div>
            <div className="text-2xl font-black text-[#E8C97A]">{(orders.reduce((s,o)=>s+o.total, 0) / 1000000).toFixed(2)}M</div>
            <div className="text-xs text-[#B09098] uppercase tracking-widest mt-2">المبيعات الإجمالية</div>
         </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MODAL COMPONENTS
// ─────────────────────────────────────────────────────────────────────────────

function CategoryModal({ category, onClose }: any) {
  const [formData, setFormData] = useState<Partial<Category>>(category || { name: '', icon: '📁', desc: '', status: 'active', img: null });
  const [loading, setLoading] = useState(false);

  const save = async () => {
    if (!formData.name) return alert('أدخل اسم القسم');
    setLoading(true);
    try {
      const id = category?.id || 'cat_' + Date.now();
      await setDoc(doc(db, 'categories', id), { ...formData, id });
      onClose();
    } catch (e) {
      console.error(e);
      alert('خطأ في الحفظ');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal title={category ? 'تعديل القسم' : 'إضافة قسم'} onClose={onClose}>
      <div className="space-y-4">
        <div className="fg">
          <label className="text-xs text-[#B09098] font-bold mb-1 block">صورة القسم (اختياري)</label>
          <div className="relative h-24 bg-[#1A1015] border-2 border-dashed border-[#3A2530] rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-[#C9A84C] transition-all">
             <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" onChange={(e) => {
               const f = e.target.files?.[0];
               if (f) {
                 const r = new FileReader();
                 r.onload = (ev) => {
                   const img = new Image();
                   img.onload = () => {
                     const canvas = document.createElement('canvas');
                     const MAX_W = 400;
                     const scale = Math.min(1, MAX_W / img.width);
                     canvas.width = img.width * scale;
                     canvas.height = img.height * scale;
                     canvas.getContext('2d')?.drawImage(img, 0, 0, canvas.width, canvas.height);
                     setFormData(prev => ({ ...prev, img: canvas.toDataURL('image/jpeg', 0.8) }));
                   };
                   img.src = ev.target?.result as string;
                 };
                 r.readAsDataURL(f);
               }
             }} />
             {formData.img ? (
               <img src={formData.img} className="h-full w-full object-cover rounded-xl" />
             ) : (
               <>
                 <Plus className="text-[#C9A84C]" size={24} />
                 <span className="text-[0.7rem] text-[#B09098] mt-1">اضغط للرفع</span>
               </>
             )}
          </div>
        </div>
        <div className="grid grid-cols-4 gap-3">
          <div className="col-span-1">
             <label className="text-xs text-[#B09098] font-bold mb-1 block">أيقونة</label>
             <input value={formData.icon} onChange={e => setFormData({...formData, icon: e.target.value})} className="w-full bg-[#1A1015] border border-[#3A2530] p-2 rounded-lg text-center" />
          </div>
          <div className="col-span-3">
             <label className="text-xs text-[#B09098] font-bold mb-1 block">الاسم</label>
             <input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-[#1A1015] border border-[#3A2530] p-2 rounded-lg" placeholder="اسم القسم..." />
          </div>
        </div>
        <div>
           <label className="text-xs text-[#B09098] font-bold mb-1 block">الوصف</label>
           <input value={formData.desc} onChange={e => setFormData({...formData, desc: e.target.value})} className="w-full bg-[#1A1015] border border-[#3A2530] p-2 rounded-lg" placeholder="وصف مختصر..." />
        </div>
        <button onClick={save} disabled={loading} className="w-full btn-g py-3 mt-4">{loading ? 'جاري الحفظ...' : 'حفظ القسم ✓'}</button>
      </div>
    </Modal>
  );
}

function ProductModal({ product, categories, onClose }: any) {
  const [formData, setFormData] = useState<Partial<Product>>(product || { 
    name: '', cat: categories[0]?.id || '', price: 0, disc: 0, desc: '', status: 'active', badge: '', icon: '📦', media: [], orders: 0 
  });
  const [loading, setLoading] = useState(false);

  const save = async () => {
    if (!formData.name || !formData.cat || !formData.price) return alert('أكمل الحقول المطلوبة');
    setLoading(true);
    try {
      const id = product?.id || 'p_' + Date.now();
      await setDoc(doc(db, 'products', id), { ...formData, id });
      onClose();
    } catch (e) {
      console.error(e);
      alert('خطأ في الحفظ');
    } finally {
      setLoading(false);
    }
  };

  const handleFile = (e: any) => {
    const files = Array.from(e.target.files as FileList || []);
    files.forEach(f => {
      const r = new FileReader();
      r.onload = (ev: ProgressEvent<FileReader>) => {
        const result = ev.target?.result as string;
        const type = f.type.startsWith('video') ? 'video' : ('image' as const);
        if (type === 'image') {
          const img = new Image();
          img.onload = () => {
            const canvas = document.createElement('canvas');
            const MAX_W = 800; // Resize to ensure it fits in Firestore (1MB limit)
            const scale = Math.min(1, MAX_W / img.width);
            canvas.width = img.width * scale;
            canvas.height = img.height * scale;
            canvas.getContext('2d')?.drawImage(img, 0, 0, canvas.width, canvas.height);
            const dataUrl = canvas.toDataURL('image/jpeg', 0.82);
            setFormData(prev => ({ ...prev, media: [...(prev.media || []), { url: dataUrl, type: 'image', name: f.name }] }));
          };
          img.src = result;
        } else {
          setFormData(prev => ({ ...prev, media: [...(prev.media || []), { url: result, type: 'video', name: f.name }] }));
        }
      };
      r.readAsDataURL(f);
    });
  };

  return (
    <Modal title={product ? 'تعديل المنتج' : 'إضافة منتج'} onClose={onClose}>
       <div className="space-y-4 max-h-[70vh] overflow-y-auto px-1 custom-scroll">
         <div>
            <label className="text-xs text-[#B09098] font-bold mb-2 block">صور وفيديوهات المنتج</label>
            <div className="grid grid-cols-4 gap-2 mb-2">
              {(formData.media || []).map((m, i) => (
                <div key={i} className="relative aspect-square rounded-lg border border-[#3A2530] overflow-hidden group">
                  {m.type === 'video' ? <video src={m.url} className="w-full h-full object-cover" /> : <img src={m.url} className="w-full h-full object-cover" />}
                  <button onClick={() => setFormData({...formData, media: formData.media?.filter((_, idx) => idx !== i)})} className="absolute top-1 left-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-[10px] text-white opacity-0 group-hover:opacity-100 transition-opacity">✕</button>
                </div>
              ))}
              <div className="relative aspect-square border-2 border-dashed border-[#3A2530] rounded-lg flex items-center justify-center group hover:border-[#C9A84C] transition-all cursor-pointer">
                <input type="file" multiple accept="image/*,video/*" onChange={handleFile} className="absolute inset-0 opacity-0 cursor-pointer" />
                <Plus size={20} className="text-[#B09098] group-hover:text-[#E8C97A]" />
              </div>
            </div>
         </div>

         <div className="grid grid-cols-2 gap-4">
            <div>
               <label className="text-xs text-[#B09098] font-bold mb-1 block">القسم</label>
               <select value={formData.cat} onChange={e => setFormData({...formData, cat: e.target.value})} className="w-full bg-[#1A1015] border border-[#3A2530] p-2 rounded-lg">
                 {categories.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
               </select>
            </div>
            <div>
               <label className="text-xs text-[#B09098] font-bold mb-1 block">أيقونة احتياطية</label>
               <input value={formData.icon} onChange={e => setFormData({...formData, icon: e.target.value})} className="w-full bg-[#1A1015] border border-[#3A2530] p-2 rounded-lg text-center" />
            </div>
         </div>

         <div>
            <label className="text-xs text-[#B09098] font-bold mb-1 block">الاسم</label>
            <input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-[#1A1015] border border-[#3A2530] p-2 rounded-lg" />
         </div>

         <div className="grid grid-cols-2 gap-4">
            <div>
               <label className="text-xs text-[#B09098] font-bold mb-1 block">السعر (د.ع)</label>
               <input type="number" value={formData.price} onChange={e => setFormData({...formData, price: Number(e.target.value)})} className="w-full bg-[#1A1015] border border-[#3A2530] p-2 rounded-lg" />
            </div>
            <div>
               <label className="text-xs text-[#B09098] font-bold mb-1 block">خصم (%)</label>
               <input type="number" value={formData.disc} onChange={e => setFormData({...formData, disc: Number(e.target.value)})} className="w-full bg-[#1A1015] border border-[#3A2530] p-2 rounded-lg" />
            </div>
         </div>

         <div className="grid grid-cols-2 gap-4">
            <div>
               <label className="text-xs text-[#B09098] font-bold mb-1 block">الحالة</label>
               <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value as any})} className="w-full bg-[#1A1015] border border-[#3A2530] p-2 rounded-lg">
                 <option value="active">نشط</option>
                 <option value="hidden">مخفي</option>
               </select>
            </div>
            <div>
               <label className="text-xs text-[#B09098] font-bold mb-1 block">ملصق (جديد، عرض...)</label>
               <input value={formData.badge} onChange={e => setFormData({...formData, badge: e.target.value})} className="w-full bg-[#1A1015] border border-[#3A2530] p-2 rounded-lg" />
            </div>
         </div>

         <button onClick={save} disabled={loading} className="w-full btn-g py-3 mt-4">{loading ? 'جاري الحفظ...' : 'حفظ المنتج ✓'}</button>
       </div>
    </Modal>
  );
}

function DiscountModal({ discount, onClose }: any) {
  const [formData, setFormData] = useState<Partial<Discount>>(discount || { code: '', type: 'percent', value: 0, expiry: '', maxUse: null, note: '', used: 0 });
  const [loading, setLoading] = useState(false);

  const save = async () => {
    if (!formData.code || !formData.value) return alert('أكمل الحقول المطلوبة');
    setLoading(true);
    try {
      const id = discount?.id || 'd_' + Date.now();
      await setDoc(doc(db, 'discounts', id), { ...formData, id, code: formData.code?.toUpperCase() });
      onClose();
    } catch (e) { console.error(e); alert('خطأ'); } finally { setLoading(false); }
  };

  return (
    <Modal title={discount ? 'تعديل الخصم' : 'إضافة خصم'} onClose={onClose}>
      <div className="space-y-4">
        <div>
           <label className="text-xs text-[#B09098] font-bold mb-1 block">كود الخصم</label>
           <input value={formData.code} onChange={e => setFormData({...formData, code: e.target.value.toUpperCase()})} className="w-full bg-[#1A1015] border border-[#3A2530] p-2 rounded-lg font-mono uppercase tracking-widest" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
             <label className="text-xs text-[#B09098] font-bold mb-1 block">النوع</label>
             <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value as any})} className="w-full bg-[#1A1015] border border-[#3A2530] p-2 rounded-lg">
               <option value="percent">نسبة %</option>
               <option value="fixed">مبلغ ثابت</option>
             </select>
          </div>
          <div>
             <label className="text-xs text-[#B09098] font-bold mb-1 block">القيمة</label>
             <input type="number" value={formData.value} onChange={e => setFormData({...formData, value: Number(e.target.value)})} className="w-full bg-[#1A1015] border border-[#3A2530] p-2 rounded-lg" />
          </div>
        </div>
        <button onClick={save} disabled={loading} className="w-full btn-g py-3 mt-4">{loading ? 'جاري الحفظ...' : 'حفظ الخصم ✓'}</button>
      </div>
    </Modal>
  );
}

function OrderDetailModal({ order, onClose }: any) {
  return (
    <Modal title="تفاصيل الطلب" onClose={onClose}>
      <div className="space-y-4 max-h-[70vh] overflow-y-auto px-1">
        <div className="bg-[#1A1015] border border-[#3A2530] rounded-xl p-4 space-y-2">
          <DetailRow label="رقم الطلب" val={order.id.slice(-8)} />
          <DetailRow label="الاسم" val={order.name} />
          <DetailRow label="الهاتف" val={<span style={{ direction: 'ltr' }}>{order.phone}</span>} />
          <DetailRow label="المحافظة" val={order.gov} />
          <DetailRow label="العنوان" val={order.address} />
          {order.note && <DetailRow label="ملاحظة" val={order.note} />}
          <DetailRow label="الحالة" val={<span className="bdg bg-o">{order.status}</span>} />
        </div>
        <div className="space-y-2">
           <h4 className="text-xs font-bold text-[#B09098]">المنتجات:</h4>
           {order.items.map((item: any, i: number) => (
             <div key={i} className="flex justify-between items-center p-3 bg-[#1A1015] border border-[#3A2530] rounded-lg">
               <div className="text-sm">{item.icon} {item.name} {item.qty > 1 && `×${item.qty}`}</div>
               <div className="text-sm font-bold text-[#E8C97A]">{(item.price * item.qty).toLocaleString()} د.ع</div>
             </div>
           ))}
        </div>
        <div className="flex justify-between items-center p-4 bg-gradient-to-l from-[#c9a84c1a] to-transparent rounded-xl border border-[#c9a84c2a]">
           <span className="font-bold">الإجمالي المجموع</span>
           <span className="text-xl font-black text-[#E8C97A]">{order.total.toLocaleString()} د.ع</span>
        </div>
      </div>
    </Modal>
  );
}

function DetailRow({ label, val }: any) {
  return (
    <div className="flex justify-between items-center text-sm">
      <span className="text-[#B09098]">{label}</span>
      <span className="font-bold">{val}</span>
    </div>
  );
}

function Modal({ title, children, onClose }: any) {
  return (
    <div className="fixed inset-0 z-[1000] bg-black/75 backdrop-blur-md flex items-center justify-center p-4 rtl">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-[#1E1318] border border-[#3A2530] rounded-2xl w-full max-w-lg shadow-2xl relative"
      >
        <div className="p-4 border-b border-[#3A2530] flex items-center justify-between">
           <h3 className="text-[#E8C97A] font-bold">{title}</h3>
           <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#251A1F] transition-all"><X size={18} /></button>
        </div>
        <div className="p-6">
          {children}
        </div>
      </motion.div>
    </div>
  );
}
