import {Component} from 'react'
import Loader from 'react-loader-spinner'
import {BsSearch} from 'react-icons/bs'
import Cookies from 'js-cookie'
import Header from '../Header'
import './index.css'
import JobCard from '../JobCard'
import ProfileCard from '../ProfileCard'
import FiltersGroup from '../FiltersGroup'

const viewsList = {
  success: 'SUCCESS',
  failure: 'FAILURE',
  inProgress: 'IN_PROGRESS',
}

class AllJobsSection extends Component {
  state = {
    jobsDataList: [],
    employType: [],
    salaryRange: '',
    searchInput: '',
    apiView: '',
  }

  componentDidMount() {
    this.getJobsData()
  }

  employFilter = value => {
    this.setState(
      prevState => ({employType: [...prevState.employType, value]}),
      this.getJobsData,
    )
  }

  salaryFilter = value => {
    this.setState({salaryRange: value}, this.getJobsData)
  }

  onSearchInput = event => {
    this.setState({searchInput: event.target.value})
  }

  onSubmitSearch = () => {
    this.getJobsData()
  }

  onRetry = () => {
    this.getJobsData()
  }

  getJobsData = async () => {
    this.setState({apiView: viewsList.inProgress})
    const {employType, salaryRange, searchInput} = this.state
    const employOptions = employType.join(',')
    const jwtToken = Cookies.get('jwt_token')
    const jobsApi = `https://apis.ccbp.in/jobs?employment_type=${employOptions}&minimum_package=${salaryRange}&search=${searchInput}`
    const options = {
      headers: {
        Authorization: `Bearer ${jwtToken}`,
      },
      method: 'GET',
    }
    const response = await fetch(jobsApi, options)

    if (response.ok === true) {
      const data = await response.json()
      const {jobs} = data
      const updateJobData = jobs.map(eachJob => ({
        id: eachJob.id,
        companyLogoUrl: eachJob.company_logo_url,
        title: eachJob.title,
        rating: eachJob.rating,
        location: eachJob.location,
        employmentType: eachJob.employment_type,
        packagePerAnnum: eachJob.package_per_annum,
        jobDescription: eachJob.job_description,
      }))
      this.setState({jobsDataList: updateJobData, apiView: viewsList.success})
    } else {
      this.setState({apiView: viewsList.failure})
    }
  }

  renderNoJobsView = () => (
    <div className="failure-container">
      <img
        src="https://assets.ccbp.in/frontend/react-js/no-jobs-img.png"
        alt="no jobs"
      />
      <h1 className="failure-heading">No Jobs Found</h1>
      <p className="failure-description ">
        We could not find any jobs. Try other filters.
      </p>
    </div>
  )

  renderJobsDetails = () => {
    const {jobsDataList} = this.state
    return (
      <>
        {jobsDataList.length === 0 ? (
          this.renderNoJobsView()
        ) : (
          <ul>
            {jobsDataList.map(eachJob => (
              <JobCard eachJob={eachJob} key={eachJob.id} />
            ))}
          </ul>
        )}
      </>
    )
  }

  renderLoader = () => (
    <div className="loader-container" data-testid="loader">
      <Loader type="ThreeDots" color="#ffffff" height="50" width="50" />
    </div>
  )

  renderFailure = () => (
    <div className="failure-container">
      <img
        src="https://assets.ccbp.in/frontend/react-js/failure-img.png"
        alt="failure view"
      />
      <h1 className="failure-heading">Oops! Something Went Wrong</h1>
      <p className="failure-description ">
        We cannot seem to find the page you are looking for.
      </p>
      <button type="button" className="retry-button" onClick={this.onRetry}>
        Retry
      </button>
    </div>
  )

  resultView = () => {
    const {apiView} = this.state
    switch (apiView) {
      case viewsList.success:
        return this.renderJobsDetails()
      case viewsList.failure:
        return this.renderFailure()
      case viewsList.inProgress:
        return this.renderLoader()
      default:
        return null
    }
  }

  render() {
    return (
      <>
        <Header />
        <div className="jobs-section-container">
          <div>
            <ProfileCard />
            <FiltersGroup
              employFilter={this.employFilter}
              salaryFilter={this.salaryFilter}
            />
          </div>
          <div className="jobs-container">
            <div className="search-container">
              <input
                type="search"
                className="search-input"
                onChange={this.onSearchInput}
              />
              <button
                type="button"
                className="button"
                data-testid="searchButton"
                onClick={this.onSubmitSearch}
              >
                <BsSearch />
              </button>
            </div>
            <div>{this.resultView()}</div>
          </div>
        </div>
      </>
    )
  }
}
export default AllJobsSection
