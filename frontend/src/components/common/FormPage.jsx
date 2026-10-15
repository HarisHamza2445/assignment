import BackLink from './BackLink';

function FormPage({ title, backTo, backLabel, children }) {
  return (
    <div className="form-page">
      {backTo && <BackLink to={backTo}>{backLabel}</BackLink>}
      <h1 className="form-page__title">{title}</h1>
      <div className="page-card form-page__card">{children}</div>
    </div>
  );
}

export default FormPage;
