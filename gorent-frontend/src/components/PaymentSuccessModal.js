import PropTypes from "prop-types";

const PAYMENT_UI = {
  esewa: {
    provider: "eSewa",
    className: "payment-success-esewa",
    helpText: "Paid from your eSewa wallet"
  },
  khalti: {
    provider: "Khalti",
    className: "payment-success-khalti",
    helpText: "Paid using your Khalti account"
  },
  mobile_banking: {
    provider: "Mobile Banking",
    className: "payment-success-mobile-banking",
    helpText: "Paid from your mobile banking app"
  }
};

function PaymentSuccessModal({ booking, method, onClose }) {
  const methodUi = PAYMENT_UI[method] || PAYMENT_UI.mobile_banking;
  const transactionRef = booking?._id
    ? `GR-${String(booking._id).slice(-8).toUpperCase()}`
    : `GR-${Date.now()}`;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal payment-modal payment-success-modal" onClick={(event) => event.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">{methodUi.provider} Payment Successful</h2>
          <button className="modal-close" onClick={onClose}>&times;</button>
        </div>

        <div className="modal-body">
          <div className={`payment-success-banner ${methodUi.className}`}>
            <div>
              <p className="payment-success-provider">{methodUi.provider}</p>
              <p className="payment-success-subtitle">{methodUi.helpText}</p>
            </div>
            <span className="payment-success-pill">SUCCESS</span>
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
        </div>

        <div className="modal-footer">
          <button type="button" className="btn btn-primary" onClick={onClose}>
            OK
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
