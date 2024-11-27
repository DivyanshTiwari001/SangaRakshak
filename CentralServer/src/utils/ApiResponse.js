class ApiResponse {
    constructor(
        statusCode,
        data=[],
        message="successfully processed request"
    ){
        this.statusCode = statusCode
        this.data = data
        this.message = message
        this.success = statusCode < 400
    }
}

export {ApiResponse}