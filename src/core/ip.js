import ip from 'ip';

hung.ip = {
    ip: ip.address("public", "ipv4").toString(),
    isV4Format: ip.isV4Format,
    isV6Format: ip.isV6Format,
    idEqual: ip.isEqual,
    isPrivate: ip.isPrivate,
    isPublic: ip.isPublic,
}