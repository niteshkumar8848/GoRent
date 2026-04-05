import PropTypes from "prop-types";

function CashPaymentPendingModal({ booking, onClose }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal payment-modal" onClick={(event) => event.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Payment Submitted</h2>
          <button className="modal-close" onClick={onClose}>&times;</button>
        </div>

        <div className="modal-body">
          <p className="payment-modal-subtitle">
            Cash payment for <strong>{booking?.vehicle?.name || "your ride"}</strong> is recorded.
          </p>
          <div className="alert alert-warning">
            Payment done, but pending admin verification.
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

CashPaymentPendingModal.propTypes = {
  booking: PropTypes.shape({
    vehicle: PropTypes.shape({
      name: PropTypes.string
    })
  }),
  onClose: PropTypes.func.isRequired
};

CashPaymentPendingModal.defaultProps = {
  booking: null
};

export default CashPaymentPendingModal;
