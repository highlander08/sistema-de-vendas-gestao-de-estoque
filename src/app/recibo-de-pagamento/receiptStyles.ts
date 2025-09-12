// src/app/recibo-de-pagamento/receiptStyles.ts
export const receiptStyles: { [key: string]: React.CSSProperties } = {
  container: {
    fontFamily: "'Inter', 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif",
    padding: '20px',
    width: '100vw',
    height: '100vh',
    margin: '0',
    backgroundColor: '#f8fafc',
    color: '#1e293b',
    boxSizing: 'border-box',
    display: 'flex',
    flexDirection: 'column',
  },
  header: {
    textAlign: 'center',
    marginBottom: '2rem',
  },
  title: {
    fontSize: '2.5rem',
    fontWeight: '700',
    color: '#0f172a',
    margin: '0 0 1rem 0',
    letterSpacing: '-0.025em',
  },
  headerLine: {
    width: '80px',
    height: '4px',
    backgroundColor: '#3b82f6',
    margin: '0 auto',
    borderRadius: '2px',
  },
  emptyState: {
    textAlign: 'center',
    padding: '4rem 2rem',
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyIcon: {
    fontSize: '4rem',
    marginBottom: '1rem',
    opacity: 0.6,
  },
  emptyTitle: {
    fontSize: '1.5rem',
    fontWeight: '600',
    color: '#374151',
    margin: '0 0 0.5rem 0',
  },
  emptyMessage: {
    color: '#6b7280',
    fontSize: '1rem',
    margin: 0,
  },
  // ... continue com TODOS os estilos do seu objeto receiptStyles original ...
  // Copie todo o objeto de estilos do seu código original aqui
};