import React, { useState } from 'react';
import { CreditCard, ShoppingBag, Truck, CheckCircle2, ShieldCheck, HelpCircle, ArrowRight, RefreshCw } from 'lucide-react';

export default function Checkout({
  cart,
  token,
  clearCart,
  navigateTo,
  showToast,
  onAuthTrigger
}) {
  const [shipping, setShipping] = useState({
    name: '',
    address: '',
    city: '',
    zip: '',
    country: ''
  });

  const [payment, setPayment] = useState({
    cardNumber: '4242 •••• •••• 4242', // Standard Stripe test card
    expiry: '12/28',
    cvc: '123',
    cardName: ''
  });

  const [processing, setProcessing] = useState(false);
  const [completedOrder, setCompletedOrder] = useState(null);

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleShippingChange = (e) => {
    setShipping({ ...shipping, [e.target.name]: e.target.value });
  };

  const handlePaymentChange = (e) => {
    setPayment({ ...payment, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token) {
      showToast('Please log in to complete checkout.', 'error');
      onAuthTrigger();
      return;
    }

    if (cart.length === 0) {
      showToast('Your shopping cart is empty.', 'error');
      return;
    }

    setProcessing(true);

    try {
      // Step 1: Initiate mock Stripe checkout session
      const checkoutSessionResponse = await fetch('/api/payment/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          items: cart.map((i) => ({ productId: i.productId, quantity: i.quantity }))
        })
      });

      const sessionData = await checkoutSessionResponse.json();
      if (!checkoutSessionResponse.ok) {
        throw new Error(sessionData.message || 'Payment initiation failed');
      }

      // Simulate a small delay for payment gateway authorization
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Step 2: Post finalized order details to server
      const orderResponse = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          items: cart.map((i) => ({
            productId: i.productId,
            quantity: i.quantity,
            title: i.title,
            price: i.price
          })),
          shippingDetails: shipping,
          paymentDetails: {
            method: 'Stripe Mock',
            transactionId: sessionData.sessionId
          }
        })
      });

      const orderData = await orderResponse.json();
      if (!orderResponse.ok) {
        throw new Error(orderData.message || 'Failed to place order');
      }

      setCompletedOrder(orderData);
      clearCart();
      showToast('Payment Authorized! Order processed successfully.', 'success');
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setProcessing(false);
    }
  };

  // If order was successfully completed, show checkout completion receipt card
  if (completedOrder) {
    return (
      <div className="animate-fade-in" style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '48px 24px',
        maxWidth: '540px',
        margin: '0 auto',
        textAlign: 'center',
        gap: '24px'
      }}>
        <div style={{
          background: 'rgba(16, 185, 129, 0.1)',
          color: 'var(--success)',
          padding: '20px',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <CheckCircle2 size={64} />
        </div>
        
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800 }}>Payment Received!</h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '8px' }}>
            Thank you for shopping with us. Your order has been placed and is currently being packaged.
          </p>
        </div>

        {/* Receipt Card */}
        <div className="glass-panel" style={{
          width: '100%',
          padding: '24px',
          borderRadius: '16px',
          border: '1px solid var(--border-light)',
          textAlign: 'left',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-light)', paddingBottom: '12px' }}>
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Order Number</span>
            <strong style={{ fontSize: '0.85rem' }}>{completedOrder.id}</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-light)', paddingBottom: '12px' }}>
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Transaction (Stripe)</span>
            <code style={{ fontSize: '0.75rem', color: 'var(--accent-primary)' }}>{completedOrder.stripeTransactionId}</code>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-light)', paddingBottom: '12px' }}>
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Deliver To</span>
            <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{completedOrder.shippingDetails.name}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '4px' }}>
            <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>Total Paid</span>
            <strong style={{ fontSize: '1.1rem', color: 'var(--accent-primary)' }}>${completedOrder.total.toFixed(2)}</strong>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '16px', width: '100%', marginTop: '12px' }}>
          <button onClick={() => navigateTo('home')} className="btn btn-secondary" style={{ flex: 1, padding: '12px' }}>
            Continue Shopping
          </button>
          <button onClick={() => navigateTo('orders')} className="btn btn-primary" style={{ flex: 1, padding: '12px' }}>
            Track Orders
          </button>
        </div>
      </div>
    );
  }

  // If not logged in, block check-out and show auth CTA card
  if (!token) {
    return (
      <div className="animate-fade-in" style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '400px',
        textAlign: 'center',
        maxWidth: '480px',
        margin: '0 auto',
        gap: '24px'
      }}>
        <div style={{
          backgroundColor: 'var(--border-light)',
          color: 'var(--accent-primary)',
          padding: '24px',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <ShoppingBag size={48} />
        </div>
        <div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Sign In Required</h2>
          <p style={{ color: 'var(--text-secondary)', marginTop: '8px', lineHeight: 1.5 }}>
            To secure your orders, persist shipping information, and verify Stripe transactions, please sign in or register an account.
          </p>
        </div>
        <button onClick={onAuthTrigger} className="btn btn-primary" style={{ padding: '12px 32px', borderRadius: '10px' }}>
          Sign In Now
        </button>
      </div>
    );
  }

  // If cart is empty, redirect or block
  if (cart.length === 0) {
    return (
      <div className="animate-fade-in" style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '400px',
        textAlign: 'center',
        gap: '20px'
      }}>
        <ShoppingBag size={48} strokeWidth={1} />
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Cart is Empty</h2>
        <p style={{ color: 'var(--text-secondary)' }}>You don't have any items to check out.</p>
        <button onClick={() => navigateTo('home')} className="btn btn-primary">
          Browse Products
        </button>
      </div>
    );
  }

  return (
    <div className="animate-fade-in" style={{ position: 'relative' }}>
      {/* Stripe processing blocker overlay */}
      {processing && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100vh',
          backgroundColor: 'rgba(11, 15, 25, 0.85)',
          backdropFilter: 'blur(6px)',
          zIndex: 500,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '20px',
          color: 'white'
        }}>
          <RefreshCw size={48} className="animate-spin" style={{ animation: 'spin 1s linear infinite', color: 'var(--accent-primary)' }} />
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Processing Payment via Stripe...</h3>
          <p style={{ color: 'var(--text-tertiary)', fontSize: '0.9rem' }}>Please do not refresh the page or click back.</p>
        </div>
      )}

      <div style={{ marginBottom: '32px' }}>
        <div className="eyebrow"><ShieldCheck size={14} /> Secure checkout</div>
        <h1 style={{ fontSize: '2.25rem', fontWeight: 800 }}>Checkout</h1>
        <p style={{ color: 'var(--text-secondary)', marginTop: '8px', maxWidth: '640px' }}>Your order is protected with encrypted payment handling and real-time delivery updates.</p>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
        gap: '40px',
        alignItems: 'start'
      }}>
        {/* Left Side: Shipping & Payment form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          
          {/* A. Shipping Form */}
          <div className="glass-panel" style={{ padding: '32px', borderRadius: '20px', border: '1px solid var(--border-light)', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', borderBottom: '1px solid var(--border-light)', paddingBottom: '16px' }}>
              <Truck size={20} style={{ color: 'var(--accent-primary)' }} />
              <h2 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Shipping Information</h2>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px' }}>Recipient Name</label>
                <input
                  type="text"
                  name="name"
                  required
                  placeholder="e.g. John Doe"
                  className="form-control"
                  value={shipping.name}
                  onChange={handleShippingChange}
                />
              </div>
              
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px' }}>Delivery Address</label>
                <input
                  type="text"
                  name="address"
                  required
                  placeholder="Street Address, Apt / Suite"
                  className="form-control"
                  value={shipping.address}
                  onChange={handleShippingChange}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px' }}>City</label>
                  <input
                    type="text"
                    name="city"
                    required
                    placeholder="City"
                    className="form-control"
                    value={shipping.city}
                    onChange={handleShippingChange}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px' }}>Postal / ZIP Code</label>
                  <input
                    type="text"
                    name="zip"
                    required
                    placeholder="ZIP Code"
                    className="form-control"
                    value={shipping.zip}
                    onChange={handleShippingChange}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px' }}>Country</label>
                <input
                  type="text"
                  name="country"
                  required
                  placeholder="Country"
                  className="form-control"
                  value={shipping.country}
                  onChange={handleShippingChange}
                />
              </div>
            </div>
          </div>

          {/* B. Simulated Stripe Card Element Form */}
          <div className="glass-panel" style={{ padding: '32px', borderRadius: '20px', border: '1px solid var(--border-light)', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', justifyContent: 'space-between', borderBottom: '1px solid var(--border-light)', paddingBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <CreditCard size={20} style={{ color: 'var(--accent-primary)' }} />
                <h2 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Card Details</h2>
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', fontWeight: 600, textTransform: 'uppercase' }}>Stripe Mock</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px' }}>Cardholder Name</label>
                <input
                  type="text"
                  name="cardName"
                  required
                  placeholder="NAME ON CARD"
                  className="form-control"
                  value={payment.cardName}
                  onChange={handlePaymentChange}
                />
              </div>

              {/* Mock Stripe Element Input Box */}
              <div style={{
                border: '1px solid var(--border-medium)',
                borderRadius: '8px',
                padding: '14px 16px',
                backgroundColor: 'var(--bg-secondary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '12px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexGrow: 1 }}>
                  <CreditCard size={18} style={{ color: 'var(--text-tertiary)' }} />
                  <input
                    type="text"
                    name="cardNumber"
                    value={payment.cardNumber}
                    onChange={handlePaymentChange}
                    style={{
                      border: 'none',
                      background: 'none',
                      color: 'var(--text-primary)',
                      fontSize: '0.95rem',
                      width: '100%',
                      padding: 0
                    }}
                    required
                  />
                </div>
                
                <div style={{ display: 'flex', gap: '8px', width: '110px' }}>
                  <input
                    type="text"
                    name="expiry"
                    value={payment.expiry}
                    onChange={handlePaymentChange}
                    placeholder="MM/YY"
                    style={{
                      border: 'none',
                      background: 'none',
                      color: 'var(--text-primary)',
                      fontSize: '0.95rem',
                      width: '50px',
                      padding: 0,
                      textAlign: 'center'
                    }}
                    required
                  />
                  <input
                    type="text"
                    name="cvc"
                    value={payment.cvc}
                    onChange={handlePaymentChange}
                    placeholder="CVC"
                    style={{
                      border: 'none',
                      background: 'none',
                      color: 'var(--text-primary)',
                      fontSize: '0.95rem',
                      width: '40px',
                      padding: 0,
                      textAlign: 'center'
                    }}
                    required
                  />
                </div>
              </div>
            </div>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              marginTop: '8px',
              fontSize: '0.75rem',
              color: 'var(--text-tertiary)'
            }}>
              <ShieldCheck size={14} style={{ color: 'var(--success)' }} />
              <span>Payments are encrypted & secured by test Stripe credentials.</span>
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{
              width: '100%',
              padding: '16px',
              borderRadius: '12px',
              fontSize: '1rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              boxShadow: '0 12px 30px rgba(139, 92, 246, 0.24)'
            }}
          >
            Place Order & Pay ${(subtotal).toFixed(2)}
            <ArrowRight size={18} />
          </button>
        </form>

        {/* Right Side: Order Summary */}
        <div className="glass-panel" style={{
          padding: '32px',
          borderRadius: '20px',
          border: '1px solid var(--border-light)',
          display: 'flex',
          flexDirection: 'column',
          gap: '24px',
          position: 'sticky',
          top: '100px'
        }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 700, borderBottom: '1px solid var(--border-light)', paddingBottom: '16px' }}>Order Summary</h2>

          {/* List items */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            maxHeight: '260px',
            overflowY: 'auto',
            paddingRight: '4px'
          }}>
            {cart.map((item) => (
              <div key={item.productId} style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                <img
                  src={item.image}
                  alt={item.title}
                  style={{
                    width: '50px',
                    height: '50px',
                    objectFit: 'cover',
                    borderRadius: '8px',
                    backgroundColor: 'var(--bg-tertiary)'
                  }}
                />
                <div style={{ flexGrow: 1, minWidth: 0 }}>
                  <h4 style={{
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }} title={item.title}>
                    {item.title}
                  </h4>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    Qty: {item.quantity} × ${item.price.toFixed(2)}
                  </span>
                </div>
                <strong style={{ fontSize: '0.85rem' }}>
                  ${(item.price * item.quantity).toFixed(2)}
                </strong>
              </div>
            ))}
          </div>

          {/* Calculation breakdown */}
          <div style={{
            borderTop: '1px solid var(--border-light)',
            paddingTop: '20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
              <span>Subtotal</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
              <span>Shipping Logistics</span>
              <span style={{ color: 'var(--success)', fontWeight: 600 }}>FREE</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
              <span>Estimated Taxes</span>
              <span>$0.00</span>
            </div>
            
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderTop: '2px solid var(--border-light)',
              paddingTop: '16px',
              marginTop: '4px'
            }}>
              <span style={{ fontWeight: 700 }}>Total</span>
              <strong style={{ fontSize: '1.4rem', color: 'var(--accent-primary)', fontWeight: 800 }}>
                ${subtotal.toFixed(2)}
              </strong>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
