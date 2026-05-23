import styles from './TradeForm.module.css'

export default function TradeForm({ form, editingId, onChange, onSubmit, onCancel }) {
  return (
    <div className={styles.grid}>

      <div className={styles.field}>
        <label>Symbol</label>
        <input name="symbol" placeholder="e.g. AAPL" value={form.symbol} onChange={onChange} />
      </div>

      <div className={styles.field}>
        <label>Direction</label>
        <select name="direction" value={form.direction} onChange={onChange}>
          <option value="LONG">Long</option>
          <option value="SHORT">Short</option>
        </select>
      </div>

      <div className={styles.field}>
        <label>Quantity</label>
        <input name="quantity" type="number" placeholder="0" value={form.quantity} onChange={onChange} />
      </div>

      <div className={styles.field}>
        <label>Date</label>
        <input name="trade_date" type="date" value={form.trade_date} onChange={onChange} />
      </div>

      <div className={styles.field}>
        <label>Entry Price</label>
        <input name="entry_price" type="number" placeholder="0.00" value={form.entry_price} onChange={onChange} />
      </div>

      <div className={styles.field}>
        <label>Exit Price</label>
        <input name="exit_price" type="number" placeholder="0.00" value={form.exit_price} onChange={onChange} />
      </div>

      <div className={`${styles.field} ${styles.fieldFull}`}>
        <label>Notes</label>
        <input name="notes" placeholder="Optional notes about this trade" value={form.notes} onChange={onChange} />
      </div>

      <div className={styles.actions}>
        <button className={styles.btnSubmit} onClick={onSubmit}>
          {editingId ? 'Update Trade' : 'Add Trade'}
        </button>
        {editingId && (
          <button className={styles.btnCancel} onClick={onCancel}>Cancel</button>
        )}
      </div>

    </div>
  )
}
