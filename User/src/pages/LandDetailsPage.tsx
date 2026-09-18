import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useParcelDetailQuery } from '../hooks/useLandQueries';
import { LoadingSkeleton } from '../components/common/LoadingSkeleton';
import { ErrorAlert } from '../components/common/ErrorAlert';

export const LandDetailsPage: React.FC = () => {
  const { landId } = useParams<{ landId: string }>();
  const navigate = useNavigate();

  const { data: parcel, isLoading, isError, refetch } = useParcelDetailQuery(landId);

  useEffect(() => {
    if (parcel) {
      navigate(`/map?landId=${encodeURIComponent(parcel.landId)}`, { replace: true });
    }
  }, [parcel, navigate]);

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {isLoading && <LoadingSkeleton type="details" />}
      {isError && (
        <ErrorAlert
          title="Land Parcel Not Found"
          message={`Could not find land parcel details for ID "${landId}".`}
          onRetry={refetch}
        />
      )}
    </div>
  );
};
