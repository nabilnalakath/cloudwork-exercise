import React, { PureComponent } from 'react';

import { WorkloadListContainer } from '../WorkloadList';
import { WorkloadFormContainer } from '../WorkloadForm';
import './App.scss';


class App extends PureComponent {
  render() {
    return (
      <div className="full--width-wrapper">
        <div className="main--container">
          <header>
            <h1>CloudWork</h1>
          </header>
          <div className="workloads--form-list-container">
            <div className="col--1 workloads--list">
              <h2>Workloads</h2>
              <WorkloadListContainer />
            </div>

            <div className="col--2 workloads--form">
              <WorkloadFormContainer />
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default App;
