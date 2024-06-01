import React from 'react'
import { CFooter } from '@coreui/react'

const AppFooter = () => {
  return (
    <CFooter>
      <div>
        <a href="https://www.bumiresourcesminerals.com/" target="_blank" rel="noopener noreferrer">
          FARMS
        </a>
        <span className="ms-1">&copy; 2023 Information Technology.</span>
      </div>
      <div className="ms-auto">
        <span className="me-1">Powered by</span>
        <a href="https://coreui.io/react" target="_blank" rel="noopener noreferrer">
          coreui
        </a>
      </div>
    </CFooter>
  )
}

export default React.memo(AppFooter)
