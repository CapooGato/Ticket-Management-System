import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function AdminDashboard() {
  const navigate = useNavigate();

  const [tickets, setTickets] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  
  const [editStatus, setEditStatus] = useState('');
  const [editComment, setEditComment] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const currentUser = JSON.parse(localStorage.getItem('currentUser')) || { name: 'Admin', surname: '' };

  useEffect(() => {
    fetchAllTickets();
  }, []);

  const fetchAllTickets = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/ticket/all'); 
      if (response.ok) {
        const data = await response.json();
        setTickets(data);
      }
    } catch (error) {
      console.error("Błąd pobierania zgłoszeń:", error);
    }
  };

  const handleRowClick = (ticket) => {
    setSelectedTicket(ticket);
    setEditStatus(ticket.status);
    setEditComment(ticket.hr_comment || '');
  };

  const handleSave = async () => {
    setIsLoading(true);
    
    const payload = {
      status: editStatus,
      hrComment: editComment
    };

    try {
      const response = await fetch(`http://localhost:8080/api/ticket/${selectedTicket.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        fetchAllTickets();
        setSelectedTicket(null);
      } else {
        alert("Wystąpił błąd podczas zapisywania zmian.");
      }
    } catch (error) {
      console.error("Błąd zapisu:", error);
      alert("Brak połączenia z serwerem.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    navigate('/');
  };

  const getStatusClass = (status) => {
    switch(status) {
      case 'OCZEKUJĄCE': return 'pending';
      case 'TRWAJĄCE': return 'in-progress';
      case 'ZAMKNIĘTE': return 'closed';
      case 'ODRZUCONE': return 'rejected';
      default: return '';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Brak daty';
    const date = new Date(dateString);
    return date.toLocaleString('pl-PL', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const getAuthorName = (ticket) => {
    if (ticket.user && ticket.user.name && ticket.user.surname) {
      return `${ticket.user.name} ${ticket.user.surname}`;
    }
    return `ID Użytkownika: ${ticket.user_id || 'Nieznany'}`;
  };

  return (
    <div className="dashboard-container">
      <header className="top-bar">
        <span>{currentUser.name} {currentUser.surname} (Administrator HR)</span>
        <button className="logout-btn" onClick={handleLogout}>Wyloguj</button>
      </header>

      <main className="content-area centered">
        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Zgłaszający</th>
                <th>Kategoria</th>
                <th>Temat zgłoszenia</th>
                <th className="date-col">Data</th>
                <th className="status-col">Status</th>
              </tr>
            </thead>
            <tbody>
              {tickets.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '20px' }}>Brak zgłoszeń w systemie.</td>
                </tr>
              ) : (
                tickets.map(ticket => (
                  <tr 
                    key={ticket.id} 
                    className="clickable-row"
                    onClick={() => handleRowClick(ticket)}
                  >
                    <td><strong>{getAuthorName(ticket)}</strong></td>
                    <td>{ticket.category}</td>
                    <td>{ticket.subject}</td>
                    <td className="date-cell">{formatDate(ticket.createdAt || ticket.created_at)}</td>
                    <td className="status-cell">
                      <span className={`status-badge ${getStatusClass(ticket.status)}`}>
                        {ticket.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </main>

      {selectedTicket && (
        <div className="modal-overlay" onClick={() => setSelectedTicket(null)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px' }}>
            <h3>Zarządzaj zgłoszeniem</h3>
            
            <div className="ticket-info">
              <p><strong>Od kogo:</strong> {getAuthorName(selectedTicket)}</p>
              <p><strong>Data utworzenia:</strong> {formatDate(selectedTicket.createdAt || selectedTicket.created_at)}</p>
              <p><strong>Kategoria:</strong> {selectedTicket.category}</p>
              <p><strong>Temat:</strong> {selectedTicket.subject}</p>
            </div>

            <div className="modal-form-group">
              <label>Treść zgłoszenia:</label>
              <textarea 
                className="text-area readonly-area" 
                readOnly 
                value={selectedTicket.description}
              ></textarea>
            </div>

            <hr />

            <div className="modal-form-group">
              <label>Zmień status:</label>
              <select 
                className="input" 
                value={editStatus} 
                onChange={(e) => setEditStatus(e.target.value)}
              >
                <option value="OCZEKUJĄCE">Oczekujące</option>
                <option value="TRWAJĄCE">W trakcie</option>
                <option value="ZAMKNIĘTE">Zamknięte</option>
                <option value="ODRZUCONE">Odrzucone</option>
              </select>
            </div>

            <div className="modal-form-group">
              <label>Komentarz HR:</label>
              <textarea 
                className="text-area" 
                placeholder="Wpisz odpowiedź lub komentarz do zgłoszenia..."
                value={editComment}
                onChange={(e) => setEditComment(e.target.value)}
              ></textarea>
            </div>

            <div className="modal-actions">
              <button className="logout-btn" onClick={() => setSelectedTicket(null)}>Anuluj</button>
              <button className="create-btn" onClick={handleSave} disabled={isLoading} style={{ marginTop: '0' }}>
                {isLoading ? 'Zapisywanie...' : 'Zatwierdź'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;