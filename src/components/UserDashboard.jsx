import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function UserDashboard() {
  const navigate = useNavigate();
  const [currentView, setCurrentView] = useState(() => {
  return localStorage.getItem('userDashboardView') || 'form';
});
  const [selectedTicket, setSelectedTicket] = useState(null);
  
  const [myTickets, setMyTickets] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  const currentUser = JSON.parse(localStorage.getItem('currentUser')) || { id: null, name: 'Błąd', surname: 'Brak danych' };

  const [formData, setFormData] = useState({
    category: 'URLOP',
    subject: '',
    description: ''
  });

  const changeView = (view) => {
  setCurrentView(view);
  localStorage.setItem('userDashboardView', view);
};

  useEffect(() => {
    if (currentUser.id) {
      fetchTickets();
    }
  }, []);

  const fetchTickets = async () => {
    try {
      const response = await fetch(`http://localhost:8080/api/ticket/user/${currentUser.id}`);
      if (response.ok) {
        const data = await response.json();
        setMyTickets(data);
      }
    } catch (error) {
      console.error("Błąd pobierania zgłoszeń:", error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage({ text: '', type: '' });

    const newTicket = {
      user: { id: currentUser.id },
      category: formData.category,
      subject: formData.subject,
      description: formData.description,
      status: 'OCZEKUJĄCE'
    };

    try {
      const response = await fetch('http://localhost:8080/api/ticket/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTicket)
      });

      if (response.ok) {
        setMessage({ text: 'Zgłoszenie zostało pomyślnie wysłane!', type: 'success' });
        setFormData({ category: 'URLOP', subject: '', description: '' });
        fetchTickets();
        setTimeout(() => setCurrentView('list'), 1500);
      } else {
        setMessage({ text: 'Wystąpił błąd podczas wysyłania zgłoszenia.', type: 'error' });
      }
    } catch (error) {
      console.error("Błąd zapisu:", error);
      setMessage({ text: 'Brak połączenia z serwerem.', type: 'error' });
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

  return (
    <div className="dashboard-container">
      <header className="top-bar">
        <span>{currentUser.name} {currentUser.surname} (Pracownik)</span>
        
        <div className="top-bar-actions">
          {currentView === 'form' ? (
            <button className="nav-btn" onClick={() => changeView('list')}>
              Przeglądaj zgłoszenia
            </button>
          ) : (
            <button className="nav-btn" onClick={() => changeView('form')}>
              Dodaj zgłoszenie
            </button>
          )}
          <button className="logout-btn" onClick={handleLogout}>Wyloguj</button>
        </div>
      </header>

      <main className="content-area centered">
        {currentView === 'form' ? (
          <form className="form-card" onSubmit={handleSubmit}>
            {message.text && (
              <p style={{ color: message.type === 'error' ? 'red' : 'green', fontWeight: 'bold' }}>
                {message.text}
              </p>
            )}

            <label>Kategoria:</label>
            <select name="category" value={formData.category} onChange={handleChange} className="input" required>
              <option value="URLOP">Urlop</option>
              <option value="KADRY">Kadry (Problemy kadrowo-płacowe)</option>
              <option value="KONFLIKTY">Konflikty w pracy</option>
              <option value="NADUŻYCIA">Nadużycia</option>
              <option value="NARUSZENIA">Naruszenia etyki i prawa</option>
              <option value="INNE">Inne</option>
            </select>

            <label>Temat zgłoszenia (max 255 znaków):</label>
            <input 
              type="text" 
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              className="input" 
              placeholder="Wpisz krótki temat..." 
              maxLength="255"
              required
            />

            <label>Treść zgłoszenia (max 512 znaków):</label>
            <textarea 
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="text-area" 
              placeholder="Opisz swój problem lub wniosek..."
              maxLength="512"
              required
            ></textarea>
            
            <button type="submit" className="create-btn" disabled={isLoading}>
              {isLoading ? 'Wysyłanie...' : 'Utwórz'}
            </button>
          </form>
        ) : (
          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Kategoria</th>
                  <th>Temat zgłoszenia</th>
                  <th className="date-col">Data złożenia</th>
                  <th className="status-col">Status</th>
                </tr>
              </thead>
              <tbody>
                {myTickets.length === 0 ? (
                  <tr>
                    <td colSpan="4" style={{ textAlign: 'center', padding: '20px' }}>Brak przypisanych zgłoszeń.</td>
                  </tr>
                ) : (
                  myTickets.map(ticket => (
                    <tr 
                      key={ticket.id} 
                      className="clickable-row" 
                      onClick={() => setSelectedTicket(ticket)}
                    >
                      <td><strong>{ticket.category}</strong></td>
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
        )}
      </main>

      {selectedTicket && (
        <div className="modal-overlay" onClick={() => setSelectedTicket(null)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <h3>Szczegóły zgłoszenia</h3>
            <p><strong>Kategoria:</strong> {selectedTicket.category}</p>
            <p><strong>Temat:</strong> {selectedTicket.subject}</p>
            <p><strong>Data:</strong> {formatDate(selectedTicket.createdAt || selectedTicket.created_at)}</p>
            <p><strong>Status:</strong> <span className={`status-badge ${getStatusClass(selectedTicket.status)}`}>{selectedTicket.status}</span></p>
            
            <hr />
            <div className="modal-form-group">
              <label>Twoja treść zgłoszenia:</label>
              <textarea className="text-area readonly-area" readOnly value={selectedTicket.description}></textarea>
            </div>

            <div className="admin-comment-section">
              <label>Komentarz HR:</label>
              <p className="comment-text">
                {selectedTicket.hrComment != null && selectedTicket.hrComment !== "" ? selectedTicket.hrComment : "Brak odpowiedzi od działu HR."}
              </p>
            </div>
            
            <div className="modal-actions">
              <button className="button" onClick={() => setSelectedTicket(null)}>Zamknij</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default UserDashboard;