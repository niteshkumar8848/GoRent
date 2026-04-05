import PropTypes from "prop-types";

const PAYMENT_OPTIONS = [
  { value: "esewa", label: "eSewa" },
  { value: "khalti", label: "Khalti" },
  { value: "mobile_banking", label: "Mobile Banking" },
  { value: "cash", label: "Cash" }
];

function BookingPaymentModal({ booking, selectedMethod, onMethodChange, onPayNow, onClose, loading }) {
  const payNowLabel = selectedMethod === "cash" ? "Confirm Cash Payment" : "I Have Paid";

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal payment-modal" onClick={(event) => event.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Complete Payment</h2>
          <button className="modal-close" onClick={onClose}>&times;</button>
        </div>

        <div className="modal-body">
          <p className="payment-modal-subtitle">
            Your ride for <strong>{booking?.vehicle?.name || "this vehicle"}</strong> is completed.
          </p>

          <div className="booking-card payment-summary-card">
            <div className="d-flex justify-between align-center">
              <span>Total Amount:</span>
              <strong className="payment-amount">₹{booking?.totalPrice || 0}</strong>
            </div>
          </div>

          <div className="payment-method-grid">
            {PAYMENT_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                className={`payment-method-chip ${selectedMethod === option.value ? "active" : ""}`}
                onClick={() => onMethodChange(option.value)}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        <div className="modal-footer">
          <button type="button" className="btn btn-outline" onClick={onClose} disabled={loading}>
            Pay Later
          </button>
          <button type="button" className="btn btn-primary" onClick={onPayNow} disabled={loading || !selectedMethod}>
            {loading ? "Processing..." : payNowLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

BookingPaymentModal.propTypes = {
  booking: PropTypes.shape({
    totalPrice: PropTypes.number,
    vehicle: PropTypes.shape({
      name: PropTypes.string
    })
  }),
  selectedMethod: PropTypes.string.isRequired,
  onMethodChange: PropTypes.func.isRequired,
  onPayNow: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
  loading: PropTypes.bool
};

BookingPaymentModal.defaultProps = {
  booking: null,
  loading: false
};

export default BookingPaymentModal;
