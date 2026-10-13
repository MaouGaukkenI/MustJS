function mustjsError(functionName, message) {
    console.error(`[MustJS] ${functionName}: ${message}`);
    console.trace();
}