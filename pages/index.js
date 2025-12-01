import Head from 'next/head';
import { useState, useEffect } from 'react';

export default function Home() {
  const [form, setForm] = useState({
    fullname: '',
    department: '',
    semester: '',
    attendance_time: '',
    food_interest: '',
    top_feature: '',
    suggestions: ''
  });
  const [semesters, setSemesters] = useState([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  function getSemestersForDept(dept) {
    switch ((dept || '').toLowerCase()) {
      case 'mca':
        return ['1', '2', '3', '4'];
      case 'bca':
        return ['1', '2', '3', '4', '5', '6'];
      case 'btech':
        return ['1', '2', '3', '4', '5', '6', '7', '8'];
      case 'mtech':
        return ['1', '2', '3', '4'];
      default:
        return [];
    }
  }

  useEffect(() => {
    const list = getSemestersForDept(form.department);
    setSemesters(list);
    if (list.length === 0) {
      setForm(prev => ({ ...prev, semester: '' }));
    } else if (!list.includes(form.semester)) {
      setForm(prev => ({ ...prev, semester: '' }));
    }
  }, [form.department]);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);

    // Basic validation: all fields required except suggestions
    if (!form.fullname || !form.department || !form.semester || !form.attendance_time || !form.food_interest || !form.top_feature) {
      setError('Please fill all required fields.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Submission failed');

      // show success animation/modal
      setSuccess(true);
      setForm({ fullname: '', department: '', semester: '', attendance_time: '', food_interest: '', top_feature: '', suggestions: '' });
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Head>
        <title>My Xampus - Student Interest Survey</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
      </Head>

      <div className="container">
        <div className="header">
          <div className="logo-icon">
            <i className="fa-solid fa-graduation-cap"></i>
          </div>
          <h1>My Xampus Survey</h1>
          <p className="subtitle">Help us build the ultimate app for A.M. Patel Institute! 🚀</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="fullname"><i className="fa-regular fa-user"></i> Full Name <span className="required-indicator">*</span></label>
            <input type="text" name="fullname" id="fullname" value={form.fullname} onChange={handleChange} placeholder="Enter your name" required aria-required="true" />
          </div>

          <div className="form-group">
            <label><i className="fa-solid fa-layer-group"></i> Department & Semester <span className="required-indicator">*</span></label>
            <div className="field-row">
              <select name="department" value={form.department} onChange={handleChange} required>
                <option value="">Select Dept</option>
                <option value="MCA">MCA</option>
                <option value="BCA">BCA</option>
                <option value="BTech">B.Tech</option>
                <option value="MTech">M.Tech</option>
                <option value="Other">Other</option>
              </select>
              <select name="semester" value={form.semester} onChange={handleChange} required disabled={semesters.length === 0} aria-disabled={semesters.length === 0}>
                <option value="">Sem</option>
                {semesters.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <div className="helper-text">Pick department first — semesters update automatically.</div>
          </div>

          <div className="form-group">
            <label><i className="fa-regular fa-clock"></i> How much lecture time is Consume in manual attendance?<span className="required-indicator">*</span></label>
            <div className="radio-group" role="radiogroup" aria-label="How much lecture time is wasted in manual attendance">
              <div className="radio-card">
                <input type="radio" id="time_low" name="attendance_time" value="< 5 mins" checked={form.attendance_time === '< 5 mins'} onChange={handleChange} required />
                <label htmlFor="time_low">&lt; 5 mins</label>
              </div>
              <div className="radio-card">
                <input type="radio" id="time_high" name="attendance_time" value="> 10 mins" checked={form.attendance_time === '> 10 mins'} onChange={handleChange} />
                <label htmlFor="time_high">&gt; 10 mins</label>
              </div>
            </div>
          </div>

          <div className="form-group">
            <label><i className="fa-solid fa-burger"></i> Would you use an app to pre-order food and skip the queue? <span className="required-indicator">*</span></label>
            <div className="radio-group" role="radiogroup" aria-label="Would you use an app to pre-order food and skip the queue">
              <div className="radio-card">
                <input type="radio" id="food_yes" name="food_interest" value="Yes" checked={form.food_interest === 'Yes'} onChange={handleChange} required />
                <label htmlFor="food_yes">Yes, definitely!</label>
              </div>
              <div className="radio-card">
                <input type="radio" id="food_no" name="food_interest" value="No" checked={form.food_interest === 'No'} onChange={handleChange} />
                <label htmlFor="food_no">Not really</label>
              </div>
            </div>
          </div>

          <div className="form-group">
            <label><i className="fa-solid fa-star"></i> Which feature do you want the most? <span className="required-indicator">*</span></label>
            <select name="top_feature" value={form.top_feature} onChange={handleChange} required>
              <option value="">Select best feature</option>
              <option value="Smart Attendance">QR Attendance</option>
              <option value="Food Ordering">Canteen Pre-ordering</option>
              <option value="Project Vault">Past Project References</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="suggestions"><i className="fa-regular fa-lightbulb"></i> Any other feature you want?</label>
            <textarea name="suggestions" id="suggestions" rows="3" value={form.suggestions} onChange={handleChange} placeholder="E.g., Bus tracking, Exam results..."></textarea>
          </div>

          {error && <p style={{ color: '#ffcccb', marginBottom: 10 }}>{error}</p>}

          <button className="submit-btn" type="submit" disabled={loading}>
            {loading ? (<><i className="fa-solid fa-circle-notch fa-spin"></i> Sending...</>) : (<>Submit Feedback <i className="fa-solid fa-paper-plane" style={{ marginLeft: 8 }}></i></>)}
          </button>
        </form>
      </div>

      <div className={`modal-overlay ${success ? 'active' : ''}`} aria-hidden={!success}>
        <div className="modal">
          <div className="success-animation" aria-hidden="true">
            <svg className="checkmark" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 52">
              <circle className="checkmark__circle" cx="26" cy="26" r="25" fill="none" />
              <path className="checkmark__check" fill="none" d="M14 27l7 7 17-17" />
            </svg>
          </div>
          <h2>Thank You!</h2>
          <p style={{ color: 'var(--text-muted)', margin: '10px 0 20px' }}>Your feedback helps us make <strong>My Xampus</strong> better.</p>
          <button className="submit-btn" onClick={() => setSuccess(false)}>Close</button>
        </div>
      </div>
    </>
  );
}
