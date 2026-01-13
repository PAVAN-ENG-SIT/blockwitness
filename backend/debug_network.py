import socket
import sys

hostname = "db.ghrwvzqmgxhaxbwbngnc.supabase.co"
port = 6543

print(f"🔍 Testing connectivity to {hostname}:{port}...")

# 1. Resolve IPs
try:
    infos = socket.getaddrinfo(hostname, port, proto=socket.IPPROTO_TCP)
except Exception as e:
    print(f"❌ DNS Resolution failed: {e}")
    sys.exit(1)

ipv4_addr = None
ipv6_addr = None

for family, type, proto, canonname, sockaddr in infos:
    addr = sockaddr[0]
    if family == socket.AF_INET:
        ipv4_addr = addr
        print(f"   found IPv4: {addr}")
    elif family == socket.AF_INET6:
        ipv6_addr = addr
        print(f"   found IPv6: {addr}")

# 2. Test Connection
def test_connect(ip, family):
    if not ip: return False
    print(f"\n👉 Attempting connection to {ip}...")
    s = socket.socket(family, socket.SOCK_STREAM)
    s.settimeout(10)
    try:
        s.connect((ip, port))
        print(f"   ✅ Connected successfully to {ip}!")
        s.close()
        return True
    except Exception as e:
        print(f"   ❌ Connection failed: {e}")
        return False

success_ipv4 = test_connect(ipv4_addr, socket.AF_INET)
success_ipv6 = test_connect(ipv6_addr, socket.AF_INET6)

print("\n--- Summary ---")
if success_ipv4 and not success_ipv6:
    print("⚠️  IPv6 is blocked, but IPv4 works.")
    print("💡 Suggestion: Force IPv4 in your connection options.")
elif success_ipv6 and not success_ipv4:
    print("⚠️  IPv4 is blocked, but IPv6 works.")
elif not success_ipv4 and not success_ipv6:
    print("❌ Both IPv4 and IPv6 connection attempts failed.")
    print("🔥 Firewall might be blocking port 5432.")
else:
    print("✅ All connections working normally.")
