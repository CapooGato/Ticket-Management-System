import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const navigate = useNavigate();
  
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    surname: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    
    const url = isLogin 
      ? 'http://localhost:8080/api/user/login' 
      : 'http://localhost:8080/api/user/save';

    const payload = isLogin 
      ? { 
          email: formData.email, 
          password: formData.password 
        }
      : { 
          name: formData.name,
          surname: formData.surname,
          email: formData.email, 
          password: formData.password,
          role: "PRACOWNIK"
        };

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        if (isLogin) {
          const data = await response.json(); 
          localStorage.setItem('currentUser', JSON.stringify(data));
          
          if (data.role === 'ADMINISTRATOR_HR') {
            navigate('/admin'); 
          } else if (data.role === 'PRACOWNIK') {
            navigate('/user'); 
          } else {
            setErrorMessage("Konto nie ma przypisanej odpowiedniej roli.");
          }
        } else {
          setSuccessMessage("Konto zostało utworzone! Możesz się teraz zalogować.");
          setIsLogin(true);
          setFormData({ email: '', password: '', name: '', surname: '' });
        }
      } else {
        setErrorMessage(isLogin ? "Błędny e-mail lub hasło!" : "Błąd rejestracji. Taki adres e-mail może już istnieć.");
      }
    } catch (error) {
      console.error("Błąd sieci:", error);
      setErrorMessage("Brak połączenia z serwerem Spring Boot.");
    }
  };

  return (
    <div className="container">
      <div className="card">
        <h2>{isLogin ? 'Logowanie' : 'Rejestracja'}</h2>
        
        {errorMessage && (
          <p style={{ color: 'red', fontSize: '14px', fontWeight: 'bold', marginBottom: '10px' }}>
            {errorMessage}
          </p>
        )}

        {successMessage && (
          <p style={{ color: 'green', fontSize: '14px', fontWeight: 'bold', marginBottom: '10px' }}>
            {successMessage}
          </p>
        )}
        
        <form onSubmit={handleSubmit} className="form">
          
          {!isLogin && (
            <>
              <div className="input-group">
                <label>Imię:</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required={!isLogin}
                  className="input"
                />
              </div>

              <div className="input-group">
                <label>Nazwisko:</label>
                <input
                  type="text"
                  name="surname"
                  value={formData.surname}
                  onChange={handleChange}
                  required={!isLogin}
                  className="input"
                />
              </div>
            </>
          )}

          <div className="input-group">
            <label>Adres e-mail:</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="input"
            />
          </div>

          <div className="input-group">
            <label>Hasło:</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              className="input"
            />
          </div>

          <button type="submit" className="button">
            {isLogin ? 'Zaloguj się' : 'Zarejestruj się'}
          </button>
        </form>

        <p className="toggle-text">
          {isLogin ? 'Nie masz jeszcze konta? ' : 'Masz już konto? '}
          <button 
            type="button" 
            onClick={() => {
              setIsLogin(!isLogin);
              setErrorMessage('');
              setSuccessMessage('');
            }}
            className="toggle-button"
          >
            {isLogin ? 'Zarejestruj się' : 'Zaloguj się'}
          </button>
        </p>
      </div>
    </div>
  );
}

export default Login;