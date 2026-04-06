function successResponse(res, data, message = 'Request successful', statusCode = 200) {
  return res.status(statusCode).json({
    success: true,
    message,
    data: data !== undefined ? data : {},
  });
}

function failResponse(res, message, statusCode = 400, data = null) {
  return res.status(statusCode).json({
    success: false,
    message,
    data,
  });
}

module.exports = { successResponse, failResponse };
