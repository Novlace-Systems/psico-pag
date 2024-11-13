import React, { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import './App.css';

function App() {
  const [date, setDate] = useState(null);
  const [chatMessages, setChatMessages] = useState([
    { sender: 'bot', text: 'Vamos agendar uma consulta? Selecione uma data ao lado.' },
  ]);
  const [timeOptions, setTimeOptions] = useState([]);
  const [isSelectingTime, setIsSelectingTime] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [timer, setTimer] = useState(86400); // 24 horas em segundos
  const [canSchedule, setCanSchedule] = useState(true);
  const [loading, setLoading] = useState(false);
  const [confirmationMessage, setConfirmationMessage] = useState('');

  const psychologists = ['Dra. Ana Carvalho', 'Dra. Beatriz Lima', 'Dra. Camila Silva', 'Dra. Diana Costa', 'Dra. Elisa Fernandes'];

  useEffect(() => {
    const startTimestamp = localStorage.getItem('startTimestamp');
    if (startTimestamp) {
      const elapsedTime = Math.floor((Date.now() - parseInt(startTimestamp, 10)) / 1000);
      const remainingTime = 86400 - elapsedTime;
      if (remainingTime > 0) {
        setTimer(remainingTime);
        setCanSchedule(false);
      } else {
        localStorage.removeItem('startTimestamp');
      }
    }
  }, []);

  useEffect(() => {
    let timerInterval;
    if (!canSchedule) {
      timerInterval = setInterval(() => {
        setTimer((prevTimer) => {
          if (prevTimer <= 1) {
            clearInterval(timerInterval);
            setCanSchedule(true);
            localStorage.removeItem('startTimestamp');
            return 86400;
          }
          return prevTimer - 1;
        });
      }, 1000);
    }

    return () => clearInterval(timerInterval);
  }, [canSchedule]);

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const handleDateChange = (selectedDate) => {
    if (!canSchedule) return;

    setDate(selectedDate);
    const formattedDate = selectedDate.toLocaleDateString('pt-BR');
    const times = ['09:00', '10:30', '13:00', '15:00', '16:30', '18:00'];
    const shuffledTimes = times.sort(() => Math.random() - 0.5);

    setTimeOptions(shuffledTimes);
    setIsSelectingTime(true);

    setChatMessages((prevMessages) => [
      ...prevMessages,
      { sender: 'user', text: `Gostaria de marcar para o dia ${formattedDate}.` },
    ]);

    setIsTyping(true);
    setTimeout(() => {
      setChatMessages((prevMessages) => [
        ...prevMessages,
        { sender: 'bot', text: `Ok, agora selecione o horário:` },
      ]);
      setIsTyping(false);
    }, 3000);
  };

  const handleTimeSelection = (time) => {
    const selectedPsychologist = psychologists[Math.floor(Math.random() * psychologists.length)];
    const formattedDate = date.toLocaleDateString('pt-BR');

    setChatMessages((prevMessages) => [
      ...prevMessages,
      { sender: 'user', text: `Prefiro o horário ${time}.` },
    ]);

    setIsSelectingTime(false);
    setCanSchedule(false);
    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      setConfirmationMessage(`Sua consulta foi agendada para o dia ${formattedDate} às ${time} com a psicóloga ${selectedPsychologist}.`);

      const startTimestamp = Date.now();
      localStorage.setItem('startTimestamp', startTimestamp);
    }, 3000);
  };

  const handleCancel = () => {
    setConfirmationMessage('');
  };

  const disableDates = ({ date }) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Zera as horas para comparar apenas a data
  
    // Desabilita datas passadas e fins de semana (sábado e domingo)
    return date < today || date.getDay() === 0 || date.getDay() === 6;
  };

  return (
    <div className="app-container">
      <div className="timer">{!canSchedule ? `Próximo agendamento em: ${formatTime(timer)}` : 'Você pode agendar uma consulta.'}</div>

      <main className="content">
        <header className="header">
          <h2>Cuide de si mesma!</h2>
          <p>Agende uma consulta gratuita com um(a) psicólogo(a) aqui pelo Aelin Web.</p>
        </header>

        <div className="appointment-section">
          <div className="calendar-container">
            <h3>Selecione uma data disponível para sua consulta:</h3>
            <div className="calendar">
            <Calendar
              onChange={handleDateChange}
              value={date}
              tileDisabled={disableDates}
              className="styled-calendar"
            />
            </div>
          </div>

          <div className="chatbot-container">
            <div className="chat-messages">
              {chatMessages.map((msg, index) => (
                <div key={index} className={`chat-message ${msg.sender}`}>
                  {msg.sender === 'bot' && (
                    <img src="DragaoLaranjaa.png" alt="Bot" className="chat-icon" />
                  )}
                  <p>{msg.text}</p>
                </div>
              ))}
              {isTyping && (
                <div className="chat-message bot">
                  <p>Digitando...</p>
                </div>
              )}
              {isSelectingTime && (
                <div className="time-options">
                  {timeOptions.map((time, index) => (
                    <button
                      key={index}
                      onClick={() => handleTimeSelection(time)}
                      className="time-button"
                    >
                      {time}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {loading && (
        <div className="overlay">
          <div className="modal">
            <img src="AbraxosCarregando.png" alt="Carregando" className="loading-image" />
            <p>Carregando...</p>
          </div>
        </div>
      )}

      {confirmationMessage && (
        <div className="overlay">
          <div className="modal">
            <h2>Sua consulta foi agendada!</h2>
            <p>Data: {date ? date.toLocaleDateString('pt-BR') : ''}</p>
            <p>Horário: {timeOptions[0]}</p>
            <p>{psychologists[0]}</p>
            <p>Link da consulta:</p>
            <a href="https://teams.microsoft.com" target="_blank" rel="noopener noreferrer">
              Clique aqui para acessar o link do Teams
            </a>
            <p>Deseja cancelar?</p>
            <div className="buttons">
              <button onClick={handleCancel}>Sim</button>
              <button onClick={() => setConfirmationMessage('')}>Não</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
