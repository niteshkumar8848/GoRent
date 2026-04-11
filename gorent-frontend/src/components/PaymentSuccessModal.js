import PropTypes from "prop-types";

const PAYMENT_UI = {
  esewa: {
    provider: "eSewa",
    className: "payment-success-esewa",
    logoSrc: "/logos/esewa-icon.png",
    logo: "eS",
    helpText: "Wallet transfer received successfully"
  },
  khalti: {
    provider: "Khalti",
    className: "payment-success-khalti",
    logoSrc: "/logos/khalti-icon.png",
    logo: "K",
    helpText: "Payment settled through Khalti"
  },
  mobile_banking: {
    provider: "Mobile Banking",
    className: "payment-success-mobile-banking",
    logoSrc: "/logos/mobile-banking.png",
    logo: "MB",
    helpText: "Bank transfer completed from mobile app"
  }
};

function PaymentSuccessModal({ booking, method, onClose }) {
  const methodUi = PAYMENT_UI[method] || PAYMENT_UI.mobile_banking;
  const transactionRef = booking?._id
    ? `GR-${String(booking._id).slice(-8).toUpperCase()}`
    : `GR-${Date.now()}`;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal payment-modal payment-success-modal payment-success-auth" onClick={(event) => event.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Payment Received Successfully</h2>
          <button className="modal-close" onClick={onClose}>&times;</button>
        </div>

        <div className="modal-body">
          <div className={`payment-success-banner ${methodUi.className}`}>
            <div className="payment-success-brand">
              <span className="payment-success-logo">
                {methodUi.logoSrc ? (
                  <img src={methodUi.logoSrc} alt={`${methodUi.provider} logo`} className="payment-success-logo-img" />
                ) : (
                  methodUi.logo
                )}
              </span>
              <div>
                <p className="payment-success-provider">{methodUi.provider}</p>
                <p className="payment-success-subtitle">{methodUi.helpText}</p>
              </div>
            </div>
            <div className="payment-success-state">
              <span className="payment-success-check">✓</span>
              <p className="payment-success-subtitle">Status: Successful</p>
            </div>
          </div>

          <div className="booking-card payment-success-card">
            <div className="payment-success-row">
              <span>Amount Paid</span>
              <strong>Rs. {booking?.totalPrice || 0}</strong>
            </div>
            <div className="payment-success-row">
              <span>Vehicle</span>
              <strong>{booking?.vehicle?.name || "Your ride"}</strong>
            </div>
            <div className="payment-success-row">
              <span>Transaction Ref</span>
              <strong>{transactionRef}</strong>
            </div>
            <div className="payment-success-row">
              <span>Paid On</span>
              <strong>{new Date().toLocaleString()}</strong>
            </div>
          </div>

          <p className="payment-success-note">
            Keep this reference for support and verification.
          </p>
        </div>

        <div className="modal-footer">
          <button type="button" className="btn btn-primary" onClick={onClose}>
            Done
          </button>
        </div>
      </div>
    </div>
  );
}

PaymentSuccessModal.propTypes = {
  booking: PropTypes.shape({
    _id: PropTypes.string,
    totalPrice: PropTypes.number,
    vehicle: PropTypes.shape({
      name: PropTypes.string
    })
  }),
  method: PropTypes.string,
  onClose: PropTypes.func.isRequired
};

PaymentSuccessModal.defaultProps = {
  booking: null,
  method: "mobile_banking"
};

export default PaymentSuccessModal;
