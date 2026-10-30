import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Navigation from './Navigation';
import { hasPermission } from '../services/session';
import './SingleView.css';

const SingleView = ({ title, fetchData, fields, basePath, customActions, writePermission, hideEdit = false }) => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    try {
      setLoading(true);
      const result = await fetchData(id);
      setData(result);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    navigate(`${basePath}/${id}/edit`);
  };

  const handleBack = () => {
    navigate(basePath);
  };

  if (loading) {
    return (
      <div>
        <Navigation />
        <div className="single-view-container">
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div>
        <Navigation />
        <div className="single-view-container">
          <p>Item not found</p>
          <button onClick={handleBack} className="single-view-button">
            Back to List
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Navigation />
      <div className="single-view-container">
        <div className="single-view-header">
          <h1>{title}</h1>
          <div className="single-view-actions">
            <button onClick={handleBack} className="single-view-button">
              Back
            </button>
            {!hideEdit && (!writePermission || hasPermission(writePermission)) && (
              <button onClick={handleEdit} className="single-view-button single-view-button-primary">
                Edit
              </button>
            )}
          </div>
        </div>
        <div className="single-view-content">
          {fields.map((field, index) => (
            <div key={index} className="single-view-field">
              <label className="single-view-label">{field.label}:</label>
              <div className="single-view-value">
                {field.render ? field.render(data[field.accessor], data) : data[field.accessor]}
              </div>
            </div>
          ))}
        </div>
        {customActions && (
          <div className="single-view-custom-actions">
            {customActions.map((action, index) => (
              <button
                key={index}
                onClick={() => action.onClick(data, id)}
                className="single-view-button single-view-button-secondary"
              >
                {action.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SingleView;

