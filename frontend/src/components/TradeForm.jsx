import './TradeForm.css'

export default function TradeForm({ form, editingId, onChange, onSubmit, onCancel }) {
  return (
    <div>
      <div className="trade-form__grid">

        <div className="form-field">
          <label>Symbol</label>
          <input name="symbol" placeholder="e.g. AAPL" value={form.symbol} onChange={onChange} />
        </div>

        <div className="form-field">
          <label>Direction</label>
          <select name="direction" value={form.direction} onChange={onChange}>
            <option value="LONG">Long</option>
            <option value="SHORT">Short</option>
          </select>
        </div>

        <div className="form-field">
          <label>Quantity</label>
          <input name="quantity" type="number" placeholder="0" value={form.quantity} onChange={onChange} />
        </div>

        <div className="form-field">
          <label>Date</label>
          <input name="trade_date" type="date" value={form.trade_date} onChange={onChange} />
        </div>

        <div className="form-field">
          <label>Entry Price</label>
          <input name="entry_price" type="number" placeholder="0.00" value={form.entry_price} onChange={onChange} />
        </div>

        <div className="form-field">
          <label>Exit Price</label>
          <input name="exit_price" type="number" placeholder="0.00" value={form.exit_price} onChange={onChange} />
        </div>

        <div className="form-field form-field--full">
          <label>Notes</label>
          <input name="notes" placeholder="Optional notes about this trade" value={form.notes} onChange={onChange} />
        </div>

        <div className="trade-form__actions">
          <button className="btn-submit" onClick={onSubmit}>
            {editingId ? 'Update Trade' : 'Add Trade'}
          </button>
          {editingId && (
            <button className="btn-cancel" onClick={onCancel}>Cancel</button>
          )}
        </div>

      </div>
    </div>
  )
}
