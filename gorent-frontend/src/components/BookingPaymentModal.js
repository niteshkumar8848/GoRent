import { useEffect, useState } from "react";
import PropTypes from "prop-types";

const NEPAL_BANK_OPTIONS = [
  "Agricultural Development Bank",
  "Citizens Bank International",
  "Everest Bank",
  "Global IME Bank",
  "Himalayan Bank",
  "Kumari Bank",
  "Laxmi Sunrise Bank",
  "Machhapuchchhre Bank",
  "Nabil Bank",
  "Nepal Bank Limited",
  "Nepal Investment Mega Bank",
  "Nepal SBI Bank",
  "NMB Bank",
  "NIC Asia Bank",
  "Prabhu Bank",
  "Prime Commercial Bank",
  "Rastriya Banijya Bank",
  "Sanima Bank",
  "Siddhartha Bank",
  "Standard Chartered Bank Nepal"
];

const PAYMENT_OPTIONS = [
  {
    value: "esewa",
    label: "eSewa",
    logoSrc: "/logos/esewa-icon.png",
    logo: "eS",
    accentClass: "payment-brand-esewa",
    subtitle: "Wallet payment in seconds"
  },
  {
    value: "khalti",
    label: "Khalti",
    logoSrc: "/logos/khalti-icon.png",
    logo: "K",
    accentClass: "payment-brand-khalti",
    subtitle: "Fast transfer with Khalti"
  },
  {
    value: "mobile_banking",
    label: "Mobile Banking",
    logoSrc: "/logos/mobile-banking.png",
    logo: "MB",
    accentClass: "payment-brand-mobile",
    subtitle: "Pay from your bank app"
  },
  {
    value: "cash",
    label: "Cash",
    logo: "रु",
    accentClass: "payment-brand-cash",
    subtitle: "Pay physically to driver/admin"
  }
];

function BookingPaymentModal({ booking, selectedMethod, onMethodChange, onPayNow, onClose, loading }) {
  const selectedOption = PAYMENT_OPTIONS.find((option) => option.value === selectedMethod) || null;
  const payNowLabel = selectedMethod === "cash" ? "Submit Cash Confirmation" : "Confirm Payment";
  const amountSymbol = selectedMethod === "cash" ? "रु" : "₹";
  const [details, setDetails] = useState({
    mobileNumber: "",
    bankName: "",
    accountNumber: "",
    accountId: "",
    securePin: "",
    transactionId: "",
    amount: Number(booking?.totalPrice || 0)
  });
  const [formError, setFormError] = useState("");

  const transactionRef = booking?._id
    ? `GR-${String(booking._id).slice(-8).toUpperCase()}`
    : `GR-${Date.now()}`;

  useEffect(() => {
    setDetails((prev) => ({
      ...prev,
      amount: Number(booking?.totalPrice || 0)
    }));
  }, [booking?.totalPrice]);

  useEffect(() => {
    setFormError("");
    setDetails((prev) => ({
      ...prev,
      mobileNumber: "",
      bankName: "",
      accountNumber: "",
      accountId: "",
      securePin: "",
      transactionId: "",
      amount: Number(booking?.totalPrice || 0)
    }));
  }, [selectedMethod, booking?.totalPrice]);

  const handleInputChange = (field, value) => {
    setFormError("");
    setDetails((prev) => ({
      ...prev,
      [field]: value
    }));
  };

  const handleConfirm = () => {
    if (!selectedOption) return;
    const isMobileBanking = selectedOption.value === "mobile_banking";

    const normalizedMobile = details.mobileNumber.replace(/\s+/g, "");
    if (!/^\+?[0-9]{7,15}$/.test(normalizedMobile)) {
      setFormError("Please enter a valid mobile number.");
      return;
    }

    if (isMobileBanking) {
      if (!details.bankName.trim()) {
        setFormError("Please select your bank name.");
        return;
      }

      if (!/^[0-9]{8,20}$/.test(details.accountNumber.trim())) {
        setFormError("Please enter a valid account number (8-20 digits).");
        return;
      }
    } else if (!details.accountId.trim()) {
      setFormError("Please enter account or wallet ID.");
      return;
    }

    if (!/^[0-9]{4,6}$/.test(details.securePin.trim())) {
      setFormError(isMobileBanking ? "Please enter a valid Txn PIN (4-6 digits)." : "Please enter a valid payment PIN/MPIN.");
      return;
    }

    const resolvedAccountId = isMobileBanking ? details.accountNumber.trim() : details.accountId.trim();

    onPayNow({
      mobileNumber: normalizedMobile,
      bankName: details.bankName.trim(),
      accountNumber: details.accountNumber.trim(),
      accountId: resolvedAccountId,
      securePin: details.securePin.trim(),
      transactionId: details.transactionId.trim(),
      amount: details.amount
    });
  };

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
              <strong className="payment-amount">{amountSymbol}{booking?.totalPrice || 0}</strong>
            </div>
          </div>

          {!selectedOption ? (
            <div className="payment-method-grid">
              {PAYMENT_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  className={`payment-method-card ${option.accentClass}`}
                  onClick={() => onMethodChange(option.value)}
                >
                  <span className="payment-method-logo">
                    {option.logoSrc ? (
                      <img src={option.logoSrc} alt={`${option.label} logo`} className="payment-method-logo-img" />
                    ) : (
                      option.logo
                    )}
                  </span>
                  <span>
                    <strong>{option.label}</strong>
                    <small>{option.subtitle}</small>
                  </span>
                </button>
              ))}
            </div>
          ) : (
            <div className={`payment-provider-ui ${selectedOption.accentClass}`}>
              <div className="payment-provider-head">
                <div className="payment-provider-brand">
                  <span className="payment-method-logo">
                    {selectedOption.logoSrc ? (
                      <img src={selectedOption.logoSrc} alt={`${selectedOption.label} logo`} className="payment-method-logo-img" />
                    ) : (
                      selectedOption.logo
                    )}
                  </span>
                  <div>
                    <p className="payment-provider-name">{selectedOption.label}</p>
                    <p className="payment-provider-note">
                      {selectedOption.value === "cash"
                        ? "Collect payment physically and confirm here."
                        : `Complete payment in your ${selectedOption.label} app, then confirm below.`}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  className="payment-change-method"
                  onClick={() => onMethodChange("")}
                  disabled={loading}
                >
                  Change
                </button>
              </div>

              <div className="payment-provider-meta">
                <div>
                  <span>Reference</span>
                  <strong>{transactionRef}</strong>
                </div>
                <div>
                  <span>Amount</span>
                  <strong>{amountSymbol}{booking?.totalPrice || 0}</strong>
                </div>
                <div>
                  <span>Status</span>
                  <strong>{selectedOption.value === "cash" ? "Awaiting Verification" : "Waiting for Confirmation"}</strong>
                </div>
              </div>

              <div className="payment-auth-form">
                {selectedOption.value === "mobile_banking" && (
                  <div className="payment-bank-section">
                    <p className="payment-bank-section-title">Banking Details</p>
                    <p className="payment-bank-section-subtitle">
                      Use your registered bank account details to verify this transfer.
                    </p>
                  </div>
                )}
                <div className="payment-form-grid">
                  {selectedOption.value === "mobile_banking" && (
                    <div className="payment-form-field payment-field-full">
                      <label>Bank Name</label>
                      <select
                        className="form-input"
                        value={details.bankName}
                        onChange={(event) => handleInputChange("bankName", event.target.value)}
                        disabled={loading}
                      >
                        <option value="">Select your bank</option>
                        {NEPAL_BANK_OPTIONS.map((bank) => (
                          <option key={bank} value={bank}>
                            {bank}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  <div className="payment-form-field">
                    <label>Mobile Number</label>
                    <input
                      type="tel"
                      className="form-input"
                      placeholder="+977 98XXXXXXXX"
                      value={details.mobileNumber}
                      onChange={(event) => handleInputChange("mobileNumber", event.target.value)}
                      disabled={loading}
                    />
                  </div>

                  <div className="payment-form-field">
                    <label>
                      {selectedOption.value === "cash"
                        ? "Collector ID"
                        : selectedOption.value === "mobile_banking"
                          ? "Account Number"
                          : "Wallet / Account ID"}
                    </label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder={
                        selectedOption.value === "cash"
                          ? "Receiver name or ID"
                          : selectedOption.value === "mobile_banking"
                            ? "Enter account number"
                            : "Enter account ID"
                      }
                      value={selectedOption.value === "mobile_banking" ? details.accountNumber : details.accountId}
                      onChange={(event) =>
                        handleInputChange(
                          selectedOption.value === "mobile_banking" ? "accountNumber" : "accountId",
                          event.target.value
                        )
                      }
                      disabled={loading}
                    />
                  </div>

                  <div className="payment-form-field">
                    <label>
                      {selectedOption.value === "cash"
                        ? "Verification PIN"
                        : selectedOption.value === "mobile_banking"
                          ? "Txn PIN"
                          : "PIN / MPIN"}
                    </label>
                    <input
                      type="password"
                      className="form-input"
                      placeholder={selectedOption.value === "mobile_banking" ? "Enter Txn PIN" : "Enter PIN"}
                      value={details.securePin}
                      onChange={(event) => handleInputChange("securePin", event.target.value)}
                      disabled={loading}
                    />
                  </div>

                  <div className="payment-form-field">
                    <label>Transaction ID (optional)</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Txn reference"
                      value={details.transactionId}
                      onChange={(event) => handleInputChange("transactionId", event.target.value)}
                      disabled={loading}
                    />
                  </div>

                  <div className="payment-form-field payment-amount-field">
                    <label>Amount</label>
                    <input
                      type="text"
                      className="form-input payment-amount-input"
                      value={`${amountSymbol}${details.amount}`}
                      readOnly
                      disabled
                    />
                  </div>
                </div>

                <p className="payment-security-note">
                  Demo mode: payment credentials are only used for UI validation and are not stored.
                </p>
                {formError && <p className="payment-form-error">{formError}</p>}
              </div>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button type="button" className="btn btn-outline" onClick={onClose} disabled={loading}>
            Pay Later
          </button>
          <button type="button" className="btn btn-primary" onClick={handleConfirm} disabled={loading || !selectedOption}>
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
