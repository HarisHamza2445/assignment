function EmptyState({ title = 'Nothing here yet', children }) {
  return (
    <div className="empty-state">
      <p className="empty-state__title">{title}</p>
      {children && <div className="empty-state__body">{children}</div>}
    </div>
  );
}

export default EmptyState;
