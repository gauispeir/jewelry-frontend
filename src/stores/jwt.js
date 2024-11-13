function base64UrlDecode(base64Url) {
    let base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');

    const padding = '='.repeat((4 - (base64.length % 4)) % 4);
    base64 += padding;

    const decodedString = atob(base64);

    return decodedString;
}

export function parseJwt(jwt) {
    const parts = jwt.split('.');
    if (parts.length !== 3) {
        throw new Error('JWT does not have 3 parts');
    }

    const payload = parts[1];
    const decodedPayload = base64UrlDecode(payload);

    return JSON.parse(decodedPayload);
}