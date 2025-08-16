import { useState, useEffect } from 'react'
import axios from 'axios'
import toast from 'react-hot-toast'
import { 
  BriefcaseIcon, 
  MapPinIcon, 
  CurrencyDollarIcon,
  ClockIcon,
  BuildingOfficeIcon
} from '@heroicons/react/24/outline'

const Jobs = () => {
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    search: '',
    type: '',
    workMode: '',
    experienceLevel: '',
    location: ''
  })

  useEffect(() => {
    fetchJobs()
  }, [filters])

  const fetchJobs = async () => {
    try {
      const queryParams = new URLSearchParams()
      Object.entries(filters).forEach(([key, value]) => {
        if (value) queryParams.append(key, value)
      })
      
      const response = await axios.get(`/api/jobs?${queryParams.toString()}`)
      setJobs(response.data.jobs)
    } catch (error) {
      console.error('Error fetching jobs:', error)
      toast.error('Failed to load jobs')
    } finally {
      setLoading(false)
    }
  }

  const handleApply = async (jobId) => {
    try {
      await axios.post(`/api/jobs/${jobId}/apply`, {
        coverLetter: 'Applied through Alumni Network'
      })
      toast.success('Application submitted successfully!')
      fetchJobs()
    } catch (error) {
      console.error('Error applying for job:', error)
      toast.error(error.response?.data?.message || 'Failed to apply for job')
    }
  }

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }))
  }

  const formatSalary = (min, max) => {
    if (!min && !max) return 'Salary not specified'
    if (!max) return `$${min.toLocaleString()}+`
    if (!min) return `Up to $${max.toLocaleString()}`
    return `$${min.toLocaleString()} - $${max.toLocaleString()}`
  }

  const getExperienceBadgeColor = (level) => {
    switch (level) {
      case 'entry': return 'bg-green-100 text-green-800'
      case 'mid': return 'bg-blue-100 text-blue-800'
      case 'senior': return 'bg-purple-100 text-purple-800'
      case 'executive': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
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
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Job Board</h1>
        
        {/* Filters */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <input
                type="text"
                placeholder="Search jobs..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div>
              <select
                value={filters.type}
                onChange={(e) => handleFilterChange('type', e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Types</option>
                <option value="full-time">Full Time</option>
                <option value="part-time">Part Time</option>
                <option value="contract">Contract</option>
                <option value="internship">Internship</option>
              </select>
            </div>
            
            <div>
              <select
                value={filters.workMode}
                onChange={(e) => handleFilterChange('workMode', e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Modes</option>
                <option value="remote">Remote</option>
                <option value="onsite">On-site</option>
                <option value="hybrid">Hybrid</option>
              </select>
            </div>
            
            <div>
              <select
                value={filters.experienceLevel}
                onChange={(e) => handleFilterChange('experienceLevel', e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Levels</option>
                <option value="entry">Entry Level</option>
                <option value="mid">Mid Level</option>
                <option value="senior">Senior Level</option>
                <option value="executive">Executive</option>
              </select>
            </div>
            
            <div>
              <input
                type="text"
                placeholder="Location"
                value={filters.location}
                onChange={(e) => handleFilterChange('location', e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>
      </div>

      {jobs.length === 0 ? (
        <div className="text-center py-12">
          <BriefcaseIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No jobs found</h3>
          <p className="mt-1 text-sm text-gray-500">
            Try adjusting your search filters or check back later for new opportunities.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {jobs.map((job) => (
            <div key={job._id} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-xl font-semibold text-gray-900">
                      {job.title}
                    </h3>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getExperienceBadgeColor(job.experienceLevel)}`}>
                      {job.experienceLevel}
                    </span>
                    {job.featured && (
                      <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">
                        Featured
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                    <div className="flex items-center">
                      <BuildingOfficeIcon className="h-4 w-4 mr-1" />
                      {job.company}
                    </div>
                    <div className="flex items-center">
                      <MapPinIcon className="h-4 w-4 mr-1" />
                      {job.location}
                    </div>
                    <div className="flex items-center">
                      <BriefcaseIcon className="h-4 w-4 mr-1" />
                      {job.type}
                    </div>
                    <div className="flex items-center">
                      <ClockIcon className="h-4 w-4 mr-1" />
                      {job.workMode}
                    </div>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="flex items-center text-green-600 font-medium mb-2">
                    <CurrencyDollarIcon className="h-4 w-4 mr-1" />
                    {formatSalary(job.salaryRange?.min, job.salaryRange?.max)}
                  </div>
                  <p className="text-sm text-gray-500">
                    Posted by {job.postedBy?.firstName} {job.postedBy?.lastName}
                  </p>
                </div>
              </div>

              <p className="text-gray-700 mb-4 line-clamp-3">
                {job.description}
              </p>

              <div className="flex items-center justify-between">
                <div className="flex flex-wrap gap-2">
                  {job.skills.slice(0, 5).map((skill, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded"
                    >
                      {skill}
                    </span>
                  ))}
                  {job.skills.length > 5 && (
                    <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">
                      +{job.skills.length - 5} more
                    </span>
                  )}
                </div>
                
                <div className="flex items-center space-x-3">
                  <span className="text-sm text-gray-500">
                    {job.applicationCount} applications
                  </span>
                  
                  {job.applicationDeadline && new Date(job.applicationDeadline) > new Date() && (
                    <button
                      onClick={() => handleApply(job._id)}
                      disabled={job.hasApplied}
                      className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                        job.hasApplied
                          ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                          : 'bg-blue-600 text-white hover:bg-blue-700'
                      }`}
                    >
                      {job.hasApplied ? 'Applied' : 'Apply Now'}
                    </button>
                  )}
                </div>
              </div>

              {job.applicationDeadline && (
                <div className="mt-3 text-sm text-gray-500">
                  Application deadline: {new Date(job.applicationDeadline).toLocaleDateString()}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default Jobs