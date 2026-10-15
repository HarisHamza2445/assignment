function DetailItem({ label, children }) {
  return (
    <div className="detail-item">
      <dt>{label}</dt>
      <dd>{children ?? '-'}</dd>
    </div>
  );
}

export default DetailItem;
