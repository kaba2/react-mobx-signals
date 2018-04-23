import * as precond from 'precond';
import {observable} from 'mobx';

export function connectable<Slot extends Function>(signal: Signal<Slot>): Connectable<Slot> {
	return signal;
}

export function dependsOn(...signals : Dependable[]) {
    for (const signal of signals) {
        signal.dependOn();
    }
}

export function batch(work: () => void, signals: Enablable[]) {
    const previous: boolean[] = [];
    for (const signal of signals) {
        previous.push(signal.enable(false));
    }
    work();
    for (let i = 0;i < signals.length;++i) {
        signals[i].enable(previous[i]);
    }
}

export interface Dependable {
	dependOn(): void;
}

export interface Enablable {
	enable(enabled?: boolean): boolean;
	disable(): boolean;
	isEnabled(): boolean;
}

export interface Connectable<Slot extends Function> {
	connect(slot: Slot, order?: number, placeLast?: boolean): Connection<Slot>;
}

export class Connection<Slot extends Function> {
	private _signal?: Signal<Slot>;
	private _slot?: Slot;
	private _next: this;
	private _prev: this;
	private _order: number;
	private _enabled: boolean;
	private _createdDuringEmit: boolean;

	/**
	 * Construct a connection with a given slot and ordering number.
	 */
	public constructor(signal: Signal<Slot>, slot: Slot, order: number) {
		this._signal = signal;
		this._slot = slot;
		this._next = this;
		this._prev = this;
		this._order = order;
		this._enabled = true;
		this._createdDuringEmit = signal.isEmitting();
	}

	/**
	 * Returns the next connection in the same signal.
	 */
	public next(): this {
		return this._next;
	}

	/**
	 * Returns the previous connection in the same signal.
	 */
	public prev(): this {
		return this._prev;
	}

	/**
	 * Returns the signal for the connection.
	 */
	public signal(): Signal<Slot> {
		precond.checkState(this.isConnected());
		return this._signal!;
	}

	/**
	 * Returns the slot for the connection.
	 * @throws this.isConnected()
	 */
	public slot(): Slot {
		precond.checkState(this.isConnected());
		return this._slot!;
	}

	/**
	 * Returns whether the connection is connected to both a signal and a slot.
	 */
	public isConnected(): boolean {
		return !!this._signal && !!this._slot;
	}

	/**
	 * Returns whether the connection was created during the current emit.
	 */
	public isCreatedInCurrentEmit(): boolean {
		return this._createdDuringEmit;
	}

	/**
	 * Returns the ordering number for the connection.
	 */
	public order(): number {
		return this._order;
	}

	/**
	 * Disconnects the connection from its signal.
	 * @returns Previous value of this.isConnected().
	 */
	public disconnect(): boolean {
		if (!this.isConnected()) {
			return false;
		}
		this._prev._link(this._next);
		this._link(this);
		this._signal = undefined;
		this._slot = undefined;
		return true;
	}

	/**
	 * Sets whether the connection should be called on emit.
	 * @returns The previous value of this.isEnabled().
	 */
    public enable(enabled: boolean = true): boolean {
        const previous = this._enabled;
        this._enabled = enabled;
        return previous;
	}

	/**
	 * Returns this.enable(false).
	 */
	public disable(): boolean {
		return this.enable(false);
	}

	/**
	 * Returns whether the connection's should be called on emit.
	 */
    public isEnabled(): boolean {
        return this._enabled && !this._createdDuringEmit;
    }

	public _link(next: this) {
		next._prev = this;
		this._next = next;
	}

	public _forgetCreatedDuringEmit() {
		this._createdDuringEmit = false;
	}
}

export class Signal<Slot extends Function> implements Connectable<Slot> {
	public readonly emit: Slot;
	private _sentinel = new Connection<Slot>(this, {} as Slot, 0);
	private _emitDepth = 0;
	private _enabled = true;
	private _connectionsCreatedDuringEmit = false;
    @observable private _mobx = {};

	/**
	 * Constructs an empty signal.
	 */
	public constructor() {
		this.emit = this._emit.bind(this);
	}

	/**
	 * Iterates over all connections.
	 */
	public *connections(): IterableIterator<Connection<Slot>> {
		let connection = this._sentinel.next();
		while (connection !== this._sentinel) {
			yield connection;
			connection = connection.next();
		}
	}

	/**
	 * Returns whether the signal does not have any connections.
	 */
	public isEmpty(): boolean {
		return this._sentinel.next() === this._sentinel;
	}

	/**
	 * Triggers a read-dependency to MobX.
	 */
	public dependOn() {
		this._mobx;
	}

	/**
	 * Disconnects all connections from the signal.
	 */
	public disconnectAll() {
		while (!this.isEmpty()) {
			this._sentinel.next().disconnect();
		}
	}

	/**
	 * Toggles whether the signal calls connections on emit.
	 * @param enabled Whether the signal should call connections on emit.
	 * @returns The previous value of isEnabled().
	 */
	public enable(enabled: boolean = true): boolean {
        const previous = this._enabled;
        this._enabled = enabled;
        return previous;
	}
	
	/**
	 * Returns this.enable(false).
	 */
	public disable(): boolean {
		return this.enable(false);
	}

	/**
	 * Returns whether the signal calls any connections on emit.
	 */
    public isEnabled(): boolean {
        return this._enabled;
    }

	/**
	 * Returns whether the signal is currently emitting.
	 */
	public isEmitting(): boolean {
		return this._emitDepth > 0;
	}

	/**
	 * Connects the signal to a slot.
	 * @param slot The slot to connect to.
	 * @param order Connections are called in order of increasing order-number.
	 * @param placeLast Whether to place an equal order number as last, as opposed to first.
	 * @returns The connection between this signal and the given slot.
	 * @throws order >= 0
	 */
	public connect(slot: Slot, order = 0, placeLast = true): Connection<Slot> {
		precond.checkState(order >= 0);
		if (this.isEmitting()) {
			this._connectionsCreatedDuringEmit = true;
		}

		const connection = new Connection<Slot>(this, slot, order);
		const searchOrder = placeLast ? (order + 1) : order;
		
		// Search for the insertion position.
		let before = this._sentinel.next();
		while (before != this._sentinel) {
			if (before.order() >= searchOrder) {
				break;
			}
			before = before.next();
		}

		// Insert into the list of connections.
		before.prev()._link(connection);
		connection._link(before);
		
		return connection;
	}

	/**
	 * Calls enabled connections in order, provided
	 * the signal is enabled.
	 */
	private _emit() {
        if (!this.isEnabled()) {
            return;
		}

		++this._emitDepth;
		for (const connection of Array.from(this.connections())) {
			if (!connection.isEnabled()) {
				continue;
			}
			connection.slot().apply(null, arguments);
		}
		--this._emitDepth;

		if (this._connectionsCreatedDuringEmit && !this.isEmitting()) {
			for (const connection of this.connections()) {
				connection._forgetCreatedDuringEmit();
			}
			this._connectionsCreatedDuringEmit = false;
		}

		this._mobx = {}
	}
}
