// Test suite to verify Sidebar active-state route matching rules and single-item activation
import assert from 'node:assert';

/**
 * Replicates the exact isNavItemActive algorithm implemented in Sidebar.tsx
 */
function isNavItemActive(item, currentPath, currentSearch, allRoleItems) {
  const [itemPath, itemQuery = ''] = item.to.split('?');

  if (itemQuery) {
    if (currentPath !== itemPath) return false;
    const itemParams = new URLSearchParams(itemQuery);
    const currentParams = new URLSearchParams(currentSearch);
    let allParamsMatch = true;
    itemParams.forEach((val, key) => {
      if (currentParams.get(key) !== val) {
        allParamsMatch = false;
      }
    });
    return allParamsMatch;
  }

  const siblingWithQuery = allRoleItems.some((other) => {
    if (other.id === item.id) return false;
    const [otherPath, otherQuery] = other.to.split('?');
    return otherPath === itemPath && Boolean(otherQuery);
  });

  if (siblingWithQuery) {
    if (currentPath.startsWith(`${itemPath}/`)) {
      return true;
    }

    if (currentPath !== itemPath) {
      return false;
    }

    const currentParams = new URLSearchParams(currentSearch);
    const anySiblingMatches = allRoleItems.some((other) => {
      if (other.id === item.id) return false;
      const [otherPath, otherQuery] = other.to.split('?');
      if (otherPath !== itemPath || !otherQuery) return false;
      const otherParams = new URLSearchParams(otherQuery);
      let matches = true;
      otherParams.forEach((v, k) => {
        if (currentParams.get(k) !== v) {
          matches = false;
        }
      });
      return matches;
    });

    return !anySiblingMatches;
  }

  if (item.exact) {
    return currentPath === itemPath;
  }

  if (currentPath === itemPath) {
    return true;
  }

  if (currentPath.startsWith(`${itemPath}/`)) {
    const hasMoreSpecificItem = allRoleItems.some((other) => {
      const otherBase = other.to.split('?')[0];
      return otherBase === currentPath;
    });
    return !hasMoreSpecificItem;
  }

  return false;
}

// Student Items
const studentNavItems = [
  { id: 'student-dashboard', to: '/student', exact: true },
  { id: 'student-new-complaint', to: '/student/complaints/new', exact: true },
  { id: 'student-my-complaints', to: '/student/complaints' },
  { id: 'student-new-request', to: '/student/requests/new', exact: true },
  { id: 'student-my-requests', to: '/student/requests' },
  { id: 'student-notices', to: '/student/notices' },
  { id: 'student-notifications', to: '/student/notifications' },
  { id: 'student-profile', to: '/student/profile' },
];

function getActiveItems(items, path, search = '') {
  return items.filter((item) => isNavItemActive(item, path, search, items));
}

console.log('Testing Navigation Active State Matching...');

// Test 1: On /student/complaints/new -> ONLY student-new-complaint active
{
  const active = getActiveItems(studentNavItems, '/student/complaints/new');
  assert.strictEqual(active.length, 1, 'Expected exactly 1 active item on /student/complaints/new');
  assert.strictEqual(active[0].id, 'student-new-complaint');
  console.log('✔ Test 1: /student/complaints/new activates ONLY New Complaint');
}

// Test 2: On /student/complaints -> ONLY student-my-complaints active
{
  const active = getActiveItems(studentNavItems, '/student/complaints');
  assert.strictEqual(active.length, 1, 'Expected exactly 1 active item on /student/complaints');
  assert.strictEqual(active[0].id, 'student-my-complaints');
  console.log('✔ Test 2: /student/complaints activates ONLY My Complaints');
}

// Test 3: On /student/complaints/CMP-2026-6701 -> ONLY student-my-complaints active
{
  const active = getActiveItems(studentNavItems, '/student/complaints/CMP-2026-6701');
  assert.strictEqual(active.length, 1, 'Expected exactly 1 active item on /student/complaints/:id');
  assert.strictEqual(active[0].id, 'student-my-complaints');
  console.log('✔ Test 3: /student/complaints/:id activates My Complaints (case details)');
}

// Test 4: On /student/requests/new -> ONLY student-new-request active
{
  const active = getActiveItems(studentNavItems, '/student/requests/new');
  assert.strictEqual(active.length, 1, 'Expected exactly 1 active item on /student/requests/new');
  assert.strictEqual(active[0].id, 'student-new-request');
  console.log('✔ Test 4: /student/requests/new activates ONLY Campus Service Requests');
}

// Test 5: On /student/requests -> ONLY student-my-requests active
{
  const active = getActiveItems(studentNavItems, '/student/requests');
  assert.strictEqual(active.length, 1, 'Expected exactly 1 active item on /student/requests');
  assert.strictEqual(active[0].id, 'student-my-requests');
  console.log('✔ Test 5: /student/requests activates ONLY My Requests');
}

// Test 6: On /student/requests/REQ-2026-001 -> ONLY student-my-requests active
{
  const active = getActiveItems(studentNavItems, '/student/requests/REQ-2026-001');
  assert.strictEqual(active.length, 1, 'Expected exactly 1 active item on /student/requests/:id');
  assert.strictEqual(active[0].id, 'student-my-requests');
  console.log('✔ Test 6: /student/requests/:id activates My Requests (request details)');
}

// Test 7: On /student -> ONLY student-dashboard active
{
  const active = getActiveItems(studentNavItems, '/student');
  assert.strictEqual(active.length, 1);
  assert.strictEqual(active[0].id, 'student-dashboard');
  console.log('✔ Test 7: /student activates ONLY Dashboard');
}

// Test 8: On /student/profile -> ONLY student-profile active (Dashboard not active)
{
  const active = getActiveItems(studentNavItems, '/student/profile');
  assert.strictEqual(active.length, 1);
  assert.strictEqual(active[0].id, 'student-profile');
  console.log('✔ Test 8: /student/profile activates ONLY Profile');
}

// Department Staff Items with Query Parameters
const deptNavItems = [
  { id: 'dept-dashboard', to: '/staff', exact: true },
  { id: 'dept-assigned', to: '/staff/cases?filter=assigned' },
  { id: 'dept-requests', to: '/admin/requests' },
  { id: 'dept-submitted', to: '/staff/cases?status=SUBMITTED' },
  { id: 'dept-in-progress', to: '/staff/cases?status=UNDER_REVIEW' },
  { id: 'dept-resolved', to: '/staff/cases?status=RESOLVED' },
  { id: 'dept-all-cases', to: '/staff/cases' },
];

// Test 9: On /staff/cases?status=SUBMITTED -> ONLY dept-submitted active
{
  const active = getActiveItems(deptNavItems, '/staff/cases', '?status=SUBMITTED');
  assert.strictEqual(active.length, 1, 'Expected 1 active item for ?status=SUBMITTED');
  assert.strictEqual(active[0].id, 'dept-submitted');
  console.log('✔ Test 9: /staff/cases?status=SUBMITTED activates ONLY Pending Cases');
}

// Test 10: On /staff/cases?status=UNDER_REVIEW -> ONLY dept-in-progress active
{
  const active = getActiveItems(deptNavItems, '/staff/cases', '?status=UNDER_REVIEW');
  assert.strictEqual(active.length, 1);
  assert.strictEqual(active[0].id, 'dept-in-progress');
  console.log('✔ Test 10: /staff/cases?status=UNDER_REVIEW activates ONLY In-progress Cases');
}

// Test 11: On /staff/cases without query -> ONLY dept-all-cases active
{
  const active = getActiveItems(deptNavItems, '/staff/cases', '');
  assert.strictEqual(active.length, 1);
  assert.strictEqual(active[0].id, 'dept-all-cases');
  console.log('✔ Test 11: /staff/cases without query activates ONLY base Queue');
}

// Test 12: On /staff/cases/CMP-01 -> ONLY dept-all-cases active (case details view)
{
  const active = getActiveItems(deptNavItems, '/staff/cases/CMP-01', '');
  assert.strictEqual(active.length, 1);
  assert.strictEqual(active[0].id, 'dept-all-cases');
  console.log('✔ Test 12: /staff/cases/:id activates base Queue (staff case details)');
}

console.log('\nAll 12 navigation matching test cases PASSED successfully!');
