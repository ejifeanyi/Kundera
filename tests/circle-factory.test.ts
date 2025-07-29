import { describe, it, expect, beforeEach } from 'vitest';

const CircleFactoryContract = {
  circles: new Map<number, any>(),
  pendingRequests: new Map<number, Set<string>>(),
  members: new Map<number, Set<string>>(),
  circleIdCounter: 0,
  contractOwner: 'ST1ADMIN1234567890',

  createCircle({ name, description, metadataUrl, creator }: { name: string; description: string; metadataUrl: string; creator: string }) {
    const id = ++this.circleIdCounter;
    this.circles.set(id, { id, name, description, metadataUrl, creator });
    this.members.set(id, new Set([creator]));
    this.pendingRequests.set(id, new Set());
    return { success: true, circleId: id };
  },

  getCircle(id: number) {
    return this.circles.get(id);
  },

  requestToJoin({ circleId, user }: { circleId: number; user: string }) {
    const pending = this.pendingRequests.get(circleId);
    if (!pending) return { success: false, error: 'CircleNotFound' };
    pending.add(user);
    return { success: true };
  },

  getPendingRequests(circleId: number) {
    return Array.from(this.pendingRequests.get(circleId) || []);
  },

  approveMember({ circleId, user, admin }: { circleId: number; user: string; admin: string }) {
    const circle = this.getCircle(circleId);
    if (!circle) return { success: false, error: 'CircleNotFound' };
    if (circle.creator !== admin) return { success: false, error: 'NotAuthorized' };
    const pending = this.pendingRequests.get(circleId);
    if (!pending?.has(user)) return { success: false, error: 'NotRequested' };

    pending.delete(user);
    this.members.get(circleId)?.add(user);
    return { success: true };
  },

  getMembers(circleId: number) {
    return Array.from(this.members.get(circleId) || []);
  },

  transferAdmin({ circleId, newAdmin, currentAdmin }: { circleId: number; newAdmin: string; currentAdmin: string }) {
    const circle = this.getCircle(circleId);
    if (!circle) return { success: false, error: 'CircleNotFound' };
    if (circle.creator !== currentAdmin) return { success: false, error: 'NotAuthorized' };

    circle.creator = newAdmin;
    this.members.get(circleId)?.add(newAdmin);
    this.circles.set(circleId, circle);
    return { success: true };
  }
};

describe('Circle Factory Contract', () => {
  const creator = 'ST1ADMIN1234567890';
  const member = 'ST1MEMBER9999999999';
  const newAdmin = 'ST1NEWADMIN1111111111';
  const unauthorizedUser = 'ST1FAKEADMIN0000000000';

  beforeEach(() => {
    CircleFactoryContract.circles.clear();
    CircleFactoryContract.members.clear();
    CircleFactoryContract.pendingRequests.clear();
    CircleFactoryContract.circleIdCounter = 0;
  });

  it('should create a circle and assign creator as initial member', () => {
    const result = CircleFactoryContract.createCircle({
      name: 'BuilderHub',
      description: 'A DAO for devs',
      metadataUrl: 'ipfs://meta-001',
      creator
    });
    expect(result.success).toBe(true);
    const circle = CircleFactoryContract.getCircle(result.circleId);
    expect(circle.name).toBe('BuilderHub');
    expect(circle.creator).toBe(creator);

    const members = CircleFactoryContract.getMembers(result.circleId);
    expect(members).toContain(creator);
  });

  it('should allow users to request to join', () => {
    const { circleId } = CircleFactoryContract.createCircle({
      name: 'OpenCircle',
      description: 'DAO test',
      metadataUrl: 'ipfs://meta-002',
      creator
    });

    const join = CircleFactoryContract.requestToJoin({ circleId, user: member });
    expect(join.success).toBe(true);

    const pending = CircleFactoryContract.getPendingRequests(circleId);
    expect(pending).toContain(member);
  });

  it('should allow creator to approve a member', () => {
    const { circleId } = CircleFactoryContract.createCircle({
      name: 'DevDAO',
      description: 'For devs',
      metadataUrl: 'ipfs://meta-003',
      creator
    });

    CircleFactoryContract.requestToJoin({ circleId, user: member });
    const approval = CircleFactoryContract.approveMember({ circleId, user: member, admin: creator });
    expect(approval.success).toBe(true);

    const members = CircleFactoryContract.getMembers(circleId);
    expect(members).toContain(member);
  });

  it('should prevent non-creator from approving a member', () => {
    const { circleId } = CircleFactoryContract.createCircle({
      name: 'LockedCircle',
      description: 'Strict DAO',
      metadataUrl: 'ipfs://meta-004',
      creator
    });

    CircleFactoryContract.requestToJoin({ circleId, user: member });
    const result = CircleFactoryContract.approveMember({ circleId, user: member, admin: unauthorizedUser });
    expect(result.success).toBe(false);
    expect(result.error).toBe('NotAuthorized');
  });

  it('should allow creator to transfer ownership', () => {
    const { circleId } = CircleFactoryContract.createCircle({
      name: 'OwnershipDAO',
      description: 'Testing admin change',
      metadataUrl: 'ipfs://meta-005',
      creator
    });

    const transfer = CircleFactoryContract.transferAdmin({
      circleId,
      newAdmin,
      currentAdmin: creator
    });

    expect(transfer.success).toBe(true);
    const updated = CircleFactoryContract.getCircle(circleId);
    expect(updated.creator).toBe(newAdmin);
  });
});
