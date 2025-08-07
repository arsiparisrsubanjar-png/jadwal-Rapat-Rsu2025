import React, { useState, useMemo } from 'react';
import { createRoot } from 'react-dom/client';

const ROOMS = ["Aula Edelweiss", "Aula Zoom Cempaka", "Aula Rawat Jalan"];

interface Booking {
  id: string;
  room: string;
  title: string;
  date: string;
  startTime: string;
  endTime: string;
}

// Initial sample data
const initialBookings: Booking[] = [
    { id: '1', room: 'Aula Edelweiss', title: 'Rapat Direksi', date: '2025-07-20', startTime: '09:00', endTime: '11:00' },
    { id: '2', room: 'Aula Zoom Cempaka', title: 'Pelatihan Karyawan', date: '2025-07-20', startTime: '13:00', endTime: '16:00' },
    { id: '3', room: 'Aula Rawat Jalan', title: 'Presentasi Produk', date: '2025-07-21', startTime: '10:00', endTime: '11:30' },
];

const Header: React.FC = () => (
    <header className="header">
        <div className="header-title-container">
            <svg className="header-logo" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white">
                <path d="M6 2c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6H6zm6 7h5v2h-5V9zm0 4h5v2h-5v-2zm-3-4H4V3h14v5h-5z" />
                <path d="M0 0h24v24H0z" fill="none"/>
            </svg>
            <h1>Jadwal Ruang Rapat RSU Kota Banjar</h1>
        </div>
    </header>
);

const Footer: React.FC = () => (
    <footer className="footer">
        <p>Hakcipta © 2025 RSU Kota Banjar</p>
    </footer>
);

interface BookingModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAddBooking: (booking: Omit<Booking, 'id'>) => void;
}

const BookingModal: React.FC<BookingModalProps> = ({ isOpen, onClose, onAddBooking }) => {
    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const newBooking = {
            room: formData.get('room') as string,
            title: formData.get('title') as string,
            date: formData.get('date') as string,
            startTime: formData.get('startTime') as string,
            endTime: formData.get('endTime') as string,
        };
        onAddBooking(newBooking);
        onClose();
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <button className="modal-close" onClick={onClose}>&times;</button>
                <h2>Buat Jadwal Baru</h2>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="room">Pilih Ruangan</label>
                        <select id="room" name="room" required>
                            {ROOMS.map(room => <option key={room} value={room}>{room}</option>)}
                        </select>
                    </div>
                    <div className="form-group">
                        <label htmlFor="title">Nama Kegiatan</label>
                        <input type="text" id="title" name="title" required />
                    </div>
                    <div className="form-group">
                        <label htmlFor="date">Tanggal</label>
                        <input type="date" id="date" name="date" required min={new Date().toISOString().split("T")[0]}/>
                    </div>
                    <div className="form-group">
                        <label htmlFor="startTime">Waktu Mulai</label>
                        <input type="time" id="startTime" name="startTime" required />
                    </div>
                    <div className="form-group">
                        <label htmlFor="endTime">Waktu Selesai</label>
                        <input type="time" id="endTime" name="endTime" required />
                    </div>
                    <div className="form-actions">
                         <button type="button" className="btn btn-danger" onClick={onClose}>Batal</button>
                        <button type="submit" className="btn btn-primary">Simpan Jadwal</button>
                    </div>
                </form>
            </div>
        </div>
    );
};


interface RoomCardProps {
    roomName: string;
    bookings: Booking[];
}

const RoomCard: React.FC<RoomCardProps> = ({ roomName, bookings }) => {
    return (
        <div className="room-card">
            <h2>{roomName}</h2>
            {bookings.length > 0 ? (
                <ul className="bookings-list">
                    {bookings.map(booking => (
                        <li key={booking.id} className="booking-item">
                            <p><strong>{booking.title}</strong></p>
                            <p>🗓️ {new Date(booking.date).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                            <p>⏰ {booking.startTime} - {booking.endTime}</p>
                        </li>
                    ))}
                </ul>
            ) : (
                <p className="no-bookings">Belum ada jadwal untuk ruangan ini.</p>
            )}
        </div>
    );
};

const App: React.FC = () => {
    const [bookings, setBookings] = useState<Booking[]>(initialBookings);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleAddBooking = (newBooking: Omit<Booking, 'id'>) => {
        setBookings(prev => [...prev, { ...newBooking, id: Date.now().toString() }]);
    };
    
    const sortedBookings = useMemo(() => {
        return [...bookings].sort((a, b) => {
            const dateA = new Date(`${a.date}T${a.startTime}`).getTime();
            const dateB = new Date(`${b.date}T${b.startTime}`).getTime();
            return dateA - dateB;
        });
    }, [bookings]);


    return (
        <div className="app-container">
            <Header />
            <main className="main-content">
                <div className="controls">
                     <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
                        + Buat Jadwal Baru
                    </button>
                </div>
                <div className="room-grid">
                    {ROOMS.map(room => {
                        const roomBookings = sortedBookings.filter(b => b.room === room);
                        return <RoomCard key={room} roomName={room} bookings={roomBookings} />;
                    })}
                </div>
            </main>
            <Footer />
            <BookingModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onAddBooking={handleAddBooking}
            />
        </div>
    );
};

const container = document.getElementById('root');
if (container) {
    const root = createRoot(container);
    root.render(<App />);
}
