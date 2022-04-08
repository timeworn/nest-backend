import {
  sendListResponse,
  sendObjectResponse,
  sendPaginatedListResponse,
} from '../response.transformer';

export const resolveResponse = async (
  service: any,
  message: string = 'Success',
) => {
  const response = await service;
  let finalresponse = null;
  if (response && response.pagination) {
    finalresponse = sendPaginatedListResponse(response, message);
  } else if (response.length > 0) {
    finalresponse = sendListResponse(response, message);
  } else {
    finalresponse = sendObjectResponse(response, message);
  }

  return finalresponse;
};
