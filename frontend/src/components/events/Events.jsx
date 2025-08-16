import { useState, useEffect } from 'react'
import axios from 'axios'
import toast from 'react-hot-toast'
import { CalendarIcon, MapPinIcon, UsersIcon } from '@heroicons/react/24/outline'

const Events = () => {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all') // all, upcoming, past, registered

  useEffect(() => {
    fetchEvents()
  }, [filter])

  const fetchEvents = async () => {
    try {
      const response = await axios.get(`/api/events?filter=${filter}`)
      setEvents(response.data.events)
    } catch (error) {
      console.error('Error fetching events:', error)
      toast.error('Failed to load events')
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async (eventId) => {
    try {
      await axios.post(`/api/events/${eventId}/register`)
      toast.success('Successfully registered for event!')
      fetchEvents()
    } catch (error) {
      console.error('Error registering for event:', error)
      toast.error(error.response?.data?.message || 'Failed to register for event')
    }
  }

  const handleUnregister = async (eventId) => {
    try {
      await axios.delete(`/api/events/${eventId}/register`)
      toast.success('Successfully unregistered from event!')
      fetchEvents()
    } catch (error) {
      console.error('Error unregistering from event:', error)
      toast.error('Failed to unregister from event')
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Events</h1>
        
        {/* Filter buttons */}
        <div className="flex space-x-4 mb-6">
          {[
            { key: 'all', label: 'All Events' },
            { key: 'upcoming', label: 'Upcoming' },
            { key: 'past', label: 'Past Events' },
            { key: 'registered', label: 'My Events' }
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === key
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {events.length === 0 ? (
        <div className="text-center py-12">
          <CalendarIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No events found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {filter === 'registered' 
              ? "You haven't registered for any events yet."
              : "No events available at the moment."
            }
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => (
            <div key={event._id} className="bg-white rounded-lg shadow-md overflow-hidden">
              {event.imageUrl && (
                <img
                  src={event.imageUrl}
                  alt={event.title}
                  className="w-full h-48 object-cover"
                />
              )}
              
              <div className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    event.type === 'workshop' ? 'bg-green-100 text-green-800' :
                    event.type === 'networking' ? 'bg-blue-100 text-blue-800' :
                    event.type === 'social' ? 'bg-purple-100 text-purple-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {event.type}
                  </span>
                  {event.isVirtual && (
                    <span className="px-2 py-1 text-xs font-medium bg-orange-100 text-orange-800 rounded-full">
                      Virtual
                    </span>
                  )}
                </div>

                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {event.title}
                </h3>
                
                <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                  {event.description}
                </p>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-gray-500">
                    <CalendarIcon className="h-4 w-4 mr-2" />
                    {formatDate(event.startDate)}
                  </div>
                  
                  {event.location && (
                    <div className="flex items-center text-sm text-gray-500">
                      <MapPinIcon className="h-4 w-4 mr-2" />
                      {event.location}
                    </div>
                  )}
                  
                  <div className="flex items-center text-sm text-gray-500">
                    <UsersIcon className="h-4 w-4 mr-2" />
                    {event.attendeeCount} / {event.maxAttendees || '∞'} attendees
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <div className="flex space-x-2">
                    {event.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  
                  {new Date(event.startDate) > new Date() && (
                    <button
                      onClick={() => 
                        event.isRegistered 
                          ? handleUnregister(event._id)
                          : handleRegister(event._id)
                      }
                      className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                        event.isRegistered
                          ? 'bg-red-100 text-red-700 hover:bg-red-200'
                          : 'bg-blue-600 text-white hover:bg-blue-700'
                      }`}
                    >
                      {event.isRegistered ? 'Unregister' : 'Register'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default Events