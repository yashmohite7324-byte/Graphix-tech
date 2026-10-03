import time
import urllib.request
import urllib.error
import json
import concurrent.futures
from statistics import mean

BASE_URL = "http://localhost:8081/api/v1"

def make_request(url, method="GET", payload=None, headers=None):
    if headers is None:
        headers = {}
    headers["Content-Type"] = "application/json"
    
    data = json.dumps(payload).encode("utf-8") if payload else None
    req = urllib.request.Request(url, data=data, headers=headers, method=method)
    
    start = time.perf_counter()
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            elapsed = (time.perf_counter() - start) * 1000
            content = resp.read()
            return True, resp.status, elapsed, len(content)
    except urllib.error.HTTPError as e:
        elapsed = (time.perf_counter() - start) * 1000
        return False, e.code, elapsed, 0
    except Exception as e:
        elapsed = (time.perf_counter() - start) * 1000
        return False, 500, elapsed, 0

def run_concurrent_test(name, url, method="GET", payload=None, headers=None, total_requests=200, concurrency=30):
    print(f"\n--- Benchmarking: {name} ({total_requests} requests, concurrency={concurrency}) ---")
    start_time = time.perf_counter()
    
    latencies = []
    successes = 0
    failures = 0
    status_codes = {}
    
    with concurrent.futures.ThreadPoolExecutor(max_workers=concurrency) as executor:
        futures = [
            executor.submit(make_request, url, method, payload, headers)
            for _ in range(total_requests)
        ]
        for future in concurrent.futures.as_completed(futures):
            ok, status, elapsed, _ = future.result()
            latencies.append(elapsed)
            status_codes[status] = status_codes.get(status, 0) + 1
            if ok:
                successes += 1
            else:
                failures += 1
                
    total_time = time.perf_counter() - start_time
    rps = total_requests / total_time
    latencies.sort()
    
    p50 = latencies[int(len(latencies) * 0.50)] if latencies else 0
    p95 = latencies[int(len(latencies) * 0.95)] if latencies else 0
    p99 = latencies[int(len(latencies) * 0.99)] if latencies else 0
    
    print(f"Results for {name}:")
    print(f"  Duration         : {total_time:.2f}s")
    print(f"  Requests/sec (RPS): {rps:.2f}")
    print(f"  Success / Failure: {successes} / {failures} (Success Rate: {(successes/total_requests)*100:.1f}%)")
    print(f"  Status Codes     : {status_codes}")
    print(f"  Avg Latency      : {mean(latencies):.2f}ms")
    print(f"  P50 / P95 / P99  : {p50:.2f}ms / {p95:.2f}ms / {p99:.2f}ms")
    
    return {
        "name": name,
        "rps": rps,
        "success_rate": (successes / total_requests) * 100,
        "avg_latency": mean(latencies),
        "p95_latency": p95
    }

def main():
    print("="*65)
    print("GRAPHIX TECHHIRE - PRODUCTION LOAD & STRESS BENCHMARK SUITE")
    print("="*65)
    
    # 1. Authenticate Super Admin
    print("\n[Step 1] Authenticating Super Admin to acquire JWT token...")
    login_url = f"{BASE_URL}/auth/login"
    login_payload = {
        "email": "admin@graphixinfotech.com",
        "password": "Graphix@Admin2026!"
    }
    
    ok, status, elapsed, _ = make_request(login_url, method="POST", payload=login_payload)
    if not ok:
        print(f"[ERROR] Could not connect to Spring Boot backend (HTTP {status}). Ensure backend is running in IntelliJ on port 8081.")
        return
        
    req = urllib.request.Request(login_url, data=json.dumps(login_payload).encode("utf-8"), headers={"Content-Type": "application/json"}, method="POST")
    with urllib.request.urlopen(req) as resp:
        body = json.loads(resp.read().decode("utf-8"))
        token = body.get("data", {}).get("accessToken")
        
    auth_headers = {"Authorization": f"Bearer {token}"}
    print(f"[SUCCESS] Acquired Admin JWT Token successfully. (Auth Latency: {elapsed:.2f}ms)")
    
    # 2. Run High-Concurrency Load Tests
    summary = []
    
    summary.append(run_concurrent_test(
        name="Public Jobs Search Feed",
        url=f"{BASE_URL}/jobs/public/search",
        total_requests=200,
        concurrency=30
    ))
    
    summary.append(run_concurrent_test(
        name="Fetch 500 Students List (Admin)",
        url=f"{BASE_URL}/admin/students",
        headers=auth_headers,
        total_requests=200,
        concurrency=30
    ))
    
    summary.append(run_concurrent_test(
        name="Branch Stream Filter Search",
        url=f"{BASE_URL}/student/search?branch=Computer+Engineering",
        headers=auth_headers,
        total_requests=200,
        concurrency=30
    ))
    
    summary.append(run_concurrent_test(
        name="Fetch 50 Tech Companies Directory",
        url=f"{BASE_URL}/admin/companies",
        headers=auth_headers,
        total_requests=200,
        concurrency=30
    ))
    
    print("\n" + "="*65)
    print("FINAL BENCHMARK SUMMARY & PERFORMANCE AUDIT REPORT")
    print("="*65)
    for s in summary:
        status_str = "PASS (High Speed)" if s["success_rate"] >= 95 and s["avg_latency"] < 200 else "NEEDS TUNING"
        print(f"- {s['name']:<38} | RPS: {s['rps']:6.1f} | Avg: {s['avg_latency']:6.1f}ms | P95: {s['p95_latency']:6.1f}ms | Status: {status_str}")
    print("="*65)

if __name__ == "__main__":
    main()
