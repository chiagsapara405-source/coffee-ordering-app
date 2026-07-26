import CartContent from "./CartContent";

export default function CartPanel({
  cart,
  subtotal,
  tax,
  total,
  ticketNo,
  onChangeQty,
  onPlaceOrder,
  onReorder,
  hasLastOrder,
  orderCount,
  pickupTime,
  onPickupTimeChange,
}) {
  return (
    <aside className="hidden lg:block sticky top-24">
      <div className="neumorphic rounded-[2rem] p-6 flex flex-col max-h-[calc(100vh-9rem)]">
        <CartContent
          cart={cart}
          subtotal={subtotal}
          tax={tax}
          total={total}
          ticketNo={ticketNo}
          onChangeQty={onChangeQty}
          onPlaceOrder={onPlaceOrder}
          onReorder={onReorder}
          hasLastOrder={hasLastOrder}
          orderCount={orderCount}
          pickupTime={pickupTime}
          onPickupTimeChange={onPickupTimeChange}
        />
      </div>
    </aside>
  );
}
