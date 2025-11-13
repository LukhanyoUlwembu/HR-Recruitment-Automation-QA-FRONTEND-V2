import React, { useEffect, useState } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { format } from 'date-fns';
import { useMsal } from '@azure/msal-react';
import { loginRequest } from '../authConfig';
import Modal from 'react-modal';
import Select from 'react-select';
import { useParams } from 'react-router-dom';
import { useAuth } from "./useAuth";
import { BASE_URL } from './useAuth';

const email = sessionStorage.getItem("empEmail");

const Schedule = () => {
  // Permission states added at the top
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const role = sessionStorage.getItem("role");
  const { instance, accounts } = useMsal();
  const { isLoggedIn, getAccessToken } = useAuth();
  const { idApplicant, id } = useParams();
  const [date, setDate] = useState(new Date());
  const [time, setTime] = useState('15:00');
  const [candidate, setCandidate] = useState({});
  const [application, setApplication] = useState({});
  const [panelOptions, setPanelOptions] = useState([]);
  const [panel, setPanel] = useState([]);
  const [events, setEvents] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [view, setView] = useState('day');
  const [selectedEvent, setSelectedEvent] = useState(null);
   const [categoryType, setCategoryType] = useState('Internal');

  useEffect(() => {
    const fetchPermissions = async () => {
      try {
        const res = await fetch(`${BASE_URL}/permissions/${role}/roles`, {
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem("token")}`,
            'Content-Type': 'application/json',
          },
        });
        if (res.ok) {
          const data = await res.json();
          setPermissions(data.map(p => p.name));
        } else {
          console.error('Failed to fetch permissions:', res.status);
        }
      } catch (err) {
        console.error('Error fetching permissions:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPermissions();
  }, [role]);

  useEffect(() => {
    const login = async () => {
      if (!accounts || accounts.length === 0) {
        try {
          await instance.loginPopup(loginRequest);
        } catch (err) {
          console.error('Auto-login failed:', err);
        }
      }
    };
    login();
  }, [accounts, instance]);

  useEffect(() => {
    const fetchUsers = async () => {
      if (!accounts || accounts.length === 0) return;
      try {
        const account = accounts[0];
        const tokenResponse = await instance.acquireTokenSilent({
          ...loginRequest,
          account,
        });
        const accessToken = tokenResponse.accessToken;

        const response = await fetch('https://graph.microsoft.com/v1.0/users?$select=displayName,mail', {
          headers: { Authorization: `Bearer ${accessToken}` },
        });

        if (!response.ok) throw new Error('Failed to fetch users from Microsoft Graph');

        const data = await response.json();

        const options = data.value
          .filter(user => user.mail && user.displayName)
          .map(user => ({
            value: user.mail,
            label: user.displayName,
          }));

        setPanelOptions(options);
      } catch (err) {
        console.error('Error fetching users:', err);
      }
    };
    fetchUsers();
  }, [accounts, instance]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res1 = await fetch(`${BASE_URL}/applicants/${idApplicant}`);
        const res2 = await fetch(`${BASE_URL}/applications/${id}`);
        const res3 = await fetch(`${BASE_URL}/interviews/${email}`);
        if (res1.ok && res2.ok) {
          const data1 = await res1.json();
          const data2 = await res2.json();
          const data3 = await res3.json();
          setCandidate(data1);
          setApplication(data2);
          const interviewEvents = Array.isArray(data3)
            ? data3.map(intv => ({
                title: `Interview: ${intv.name}`,
                time: intv.interviewDate,
                joinUrl: intv.link,
                panel: intv.panel?.split(', ') || [],
              }))
            : [{
                title: `Interview: ${data3.name}`,
                time: data3.interviewDate,
                joinUrl: data3.link,
                panel: data3.panel?.split(', ') || [],
              }];

          setEvents(interviewEvents);
        }
      } catch (err) {
        console.error('Error fetching data:', err.message);
      }
    };


    fetchData();
  }, [id, idApplicant]);

  // Early returns after hooks
  if (loading) {
    return <div className="text-center p-6">Loading permissions...</div>;
  }

  if (!permissions.includes("schedule_interview")) {
    return (
      <div className="text-center p-6">
        <h2 className="text-2xl font-bold mb-4">Access Denied</h2>
        <p>You do not have permission to schedule interviews.</p>
      </div>
    );
  }


  const createTeamsMeeting = async () => {
    if (!isLoggedIn) {
      alert("Please login first.");
      return;
    }

    if (!candidate.email || panel.length === 0) {
      alert('Please select a candidate and at least one panel member.');
      return;
    }

    try {
      const accessToken = await getAccessToken();
      if (!accessToken) throw new Error("No access token");

      const [hours, minutes] = time.split(':').map(Number);
      const start = new Date(date);
      start.setHours(hours, minutes, 0);
      const end = new Date(start.getTime() + 30 * 60 * 1000);

      const attendees = [
        { value: candidate.email, label: candidate.name || candidate.email },
        ...panel,
      ];

      // Step 1: Create the Teams Meeting
      const meetingResponse = await fetch('https://graph.microsoft.com/v1.0/me/onlineMeetings', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          startDateTime: start.toISOString(),
          endDateTime: end.toISOString(),
          subject: `${application.jobPosting.jobTitle} Interview - ${candidate.name} ${candidate.surname}`,
          participants: {
            attendees: attendees.map(a => ({
              upn: a.value
            })),
          },
        }),
      });

      const meeting = await meetingResponse.json();

      // Step 2: Send Outlook calendar invite with Teams link
      const eventResponse = await fetch('https://graph.microsoft.com/v1.0/me/events', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subject: `${application.jobPosting.jobTitle} Interview - ${candidate.name} ${candidate.surname}`,
          start: {
            dateTime: start.toISOString(),
            timeZone: 'UTC'
          },
          end: {
            dateTime: end.toISOString(),
            timeZone: 'UTC'
          },
          location: {
            displayName: 'Microsoft Teams Meeting'
          },
          attendees: attendees.map(a => ({
            emailAddress: {
              address: a.value,
              name: a.label
            },
            type: "required"
          })),
          isOnlineMeeting: true,
          onlineMeetingProvider: "teamsForBusiness",
          body: {
            contentType: 'HTML',
            content: `
              <p>Dear ${candidate.name || "Candidate"},</p>
              <br />
              <p>Thank you for the interest you have shown in the Ulwembu Business Services ${application.jobPosting.jobTitle} role.</p>
              <br />
              <p>We hereby invite you to attend an interview for this position.</p>
              <p><strong>Your interview has been scheduled for:</strong></p>
              <p><strong>Date:</strong> ${start.toLocaleDateString()}</p>
              <p><strong>Time:</strong> ${start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
              <p>The interview will take place via Microsoft Teams.</p>
              <hr />
              <p><strong>Microsoft Teams Need help?</strong></p>
              <p><a href="${meeting.joinWebUrl}">Join the meeting now</a></p>
              <p><a href="https://ulwembubs.com/">For organizers: Meeting options</a></p>
            `
          },
        }),
      });

      if (!eventResponse.ok) throw new Error("Failed to send calendar invite");

      // Step 3: Save to backend
      const interviewObj = {
        interviewDate: start,
        panel: panel.map(p => p.label).join(', '),
        interviewer: email,
        feedBack: '',
        link: meeting.joinWebUrl,
        categoryType:categoryType
      };

      const payload = {
        ...application,
        status: application.status,
        interviews: [interviewObj],
      };

      const updateRes = await fetch(`${BASE_URL}/applications/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!updateRes.ok) throw new Error("Failed to update interview");

      const newEvent = {
        title: `Interview: ${candidate.name || candidate.email}`,
        time: start,
        joinUrl: meeting.joinWebUrl,
        panel: panel.map(p => p.label),
      };

      setEvents(prev => [...prev, newEvent]);
      setSelectedEvent(null);
      setIsModalOpen(false);
    } catch (err) {
      console.error('Meeting creation failed:', err);
    }
  };

  const filteredEvents = events.filter(
    event => new Date(event.time).toDateString() === date.toDateString()
  );

  const handleEventClick = (event) => {
    setSelectedEvent(event);
    setIsModalOpen(true);
  };

  const handleViewChange = (view) => setView(view);

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6 border rounded-md bg-white shadow-2xl">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Schedule</h1>
        <input type="text" placeholder="Search" className="border px-3 py-1 rounded-md" />
      </div>

      <div className="flex justify-between items-center border p-4 rounded-md shadow-sm">
        <div className="flex gap-4 items-center">
          {['day', 'week', 'month'].map(v => (
            <p
              key={v}
              onClick={() => handleViewChange(v)}
              className={`cursor-pointer hover:underline ${view === v ? 'font-semibold' : ''}`}
            >
              {v.charAt(0).toUpperCase() + v.slice(1)}
            </p>
          ))}
        </div>
        <button
          onClick={() => {
            setSelectedEvent(null);
            setIsModalOpen(true);
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
        >
          Create Interview
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Calendar onChange={setDate} value={date} view={view} />
        </div>

        <div className="border p-4 rounded-md shadow-sm space-y-3">
          <h2 className="text-lg font-semibold">Events on {format(date, 'PPP')}</h2>
          {filteredEvents.length === 0 ? (
            <p>No events for this day.</p>
          ) : (
            filteredEvents.map((event, index) => (
              <div
                key={index}
                className="border rounded px-3 py-2 cursor-pointer hover:bg-gray-100"
                onClick={() => handleEventClick(event)}
              >
                <p className="font-medium">{event.title}</p>
                <p className="text-sm text-gray-500">{format(new Date(event.time), 'p')}</p>
              </div>
            ))
          )}
        </div>
      </div>

      <Modal
        isOpen={isModalOpen && selectedEvent !== null}
        onRequestClose={() => setIsModalOpen(false)}
        ariaHideApp={false}
        className="fixed inset-0 flex justify-center items-center p-4"
      >
        <div className="bg-white rounded-lg shadow-lg w-96 p-6 space-y-4">
          <h2 className="text-xl font-semibold">Interview Details</h2>
          {selectedEvent && (
            <>
              <p className="font-medium">Candidate: {selectedEvent.title.replace('Interview: ', '')}</p>
              <p className="font-medium">Time: {format(new Date(selectedEvent.time), 'PPP p')}</p>
              <p className="font-medium">Panel: {selectedEvent.panel.join(', ')}</p>
              <p className="font-medium text-blue-600">
                <a href={selectedEvent.joinUrl} target="_blank" rel="noopener noreferrer">
                  Join Meeting
                </a>
              </p>
            </>
          )}
          <button
            onClick={() => setIsModalOpen(false)}
            className="bg-gray-500 text-white px-4 py-2 rounded-md"
          >
            Close
          </button>
        </div>
      </Modal>

      {/* Create Interview Modal */}
     <Modal
        isOpen={isModalOpen && selectedEvent !== null}
        onRequestClose={() => setIsModalOpen(false)}
        ariaHideApp={false}
        className="fixed inset-0 flex justify-center items-center p-4"
      >
        <div className="bg-white rounded-lg shadow-lg w-96 p-6 space-y-4">
          <h2 className="text-xl font-semibold">Interview Details</h2>
          {selectedEvent && (
            <>
              <p className="font-medium">Candidate: {selectedEvent.title.replace('Interview: ', '')}</p>
              <p className="font-medium">Time: {format(new Date(selectedEvent.time), 'PPP p')}</p>
              <p className="font-medium">Panel: {selectedEvent.panel.join(', ')}</p>
              <p className="font-medium text-blue-600">
                <a href={selectedEvent.joinUrl} target="_blank" rel="noopener noreferrer">
                  Join Meeting
                </a>
              </p>
            </>
          )}
          <button
            onClick={() => setIsModalOpen(false)}
            className="bg-gray-500 text-white px-4 py-2 rounded-md"
          >
            Close
          </button>
        </div>
      </Modal>

      {/* Create Interview Modal */}
      <Modal
  isOpen={isModalOpen && selectedEvent === null}
  onRequestClose={() => setIsModalOpen(false)}
  ariaHideApp={false}
  className="fixed inset-0 flex justify-center items-center "
>
  <div className="bg-white rounded-lg shadow-lg w-full max-w-xl p-6 space-y-6">
    <h2 className="text-xl font-semibold">Create Interview</h2>
    <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
      {/* LEFT COLUMN */}
      <div className="space-y-4">
        <div>
          <label htmlFor="candidate" className="block font-medium">Candidate</label>
          <input
            id="candidate"
            value={candidate.email || ''}
            readOnly
            className="w-full border px-3 py-1 rounded-md"
          />
        </div>

        <div>
          <label htmlFor="panel" className="block font-medium">Panel</label>
          <Select
        id="panel"
        options={panelOptions}
        isMulti
        value={panel}
        onChange={setPanel}
        placeholder="Select panel members"
      />
        </div>

        <div>
          <label htmlFor="time" className="block font-medium">Time</label>
          <input
            type="time"
            id="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className="w-full border px-3 py-1 rounded-md"
          />
        </div>

        <div>
          <label htmlFor="categoryType" className="block font-medium">Category Type</label>
          <select
            id="categoryType"
            value={categoryType}
            onChange={(e) => setCategoryType(e.target.value)}
            className="w-full border px-3 py-1 rounded-md"
          >
            <option value="Internal">Internal</option>
            <option value="External">External</option>
          </select>
        </div>
      </div>

      
    </div>

    {/* BUTTONS */}
    <div className="flex  gap-4 mt-4">
      <button
        onClick={() => setIsModalOpen(false)}
        className="bg-gray-500 text-white px-4 py-2 rounded-md"
      >
        Cancel
      </button>
      <button
        onClick={createTeamsMeeting}
        className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
      >
        Create Interview
      </button>
    </div>
  </div>
</Modal>

    </div>
  );
};

export default Schedule;

