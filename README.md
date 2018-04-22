React, MobX and signals and slots
=================================

This is an example project demonstrating how to combine React, MobX and typed-signals (signals and slots) to enable object-oriented state management combined with a reactive user interface.

Signals and slots
-----------------

An object must be able to control when its state-changes are exposed outside, because only the object knows the instants at which its invariants are satisfied, or when a state-change is relevant. An object is in _valid state_ whenever its invariants are satisfied, and in _invalid state_ otherwise. Every time a member function of a (correctly-implemented) object is called, an object starts from a valid state, incrementally modifies its state, perhaps passing through invalid states, and finally ends up back to another valid state --- as specified by the member function's contract. The invalid states in the middle must remain hidden from outside observers, as must valid but irrelevant states. An object specifies valid and relevant program-locations at which it notifies interested observers about its state-changes. These program-locations are specified by emitting a signal. 

A _signal_ is an object which stores a set of functions with the same signature. For a given signal, its _slot_ is a function with the same signature as the signal. When a signal stores a slot, we say that the signal is _connected_ to that slot. A signal is _emitted_ by calling its slots one by one. 

The type of the state-change of an object is encoded by the memory-address of the signal-object, and the details of that state-change are encoded in the function-arguments when calling each slot. For example, a collection of elements could emit a signal called `elementAdded(element)` after adding an element into the collection, where the added element is provided as an argument. The signals form the interface by which objects communicate with each other at well-defined instants.

### Implementation

Implementing the signals and slots mechanism is simple. For example, the source code for typed-signals library takes about 360 lines with comments and some additional bells and whistles. Modifying this library or rolling your own should be in reach for any project.

Connecting signals and slot with MobX
-------------------------------------

Signals and slots can be combined with the MobX library by specifying that each emit of a signal also updates a MobX observable stored in the signal. In this demonstration we have modified the typed-signals library (which we store locally rather than as a dependency) in the following minimal way.

* Add a new import in `Signal.ts`:

	import {observable} from 'mobx';

* Add a new Signal class member:

	@observable public mobx = {};

* Add a new assignment at the end of `Signal.emitInternal()`:

    this.mobx = {}

These changes achieve the goal of notifying MobX whenever a signal is emitted. Ideally, we would never see MobX observables again in our code; signals are the interface for state-change-communication between objects at valid and relevant states.

Connecting MobX with React
--------------------------

The MobX library is connected with React in the following minimal way:

* Add a new import to a React component file:
	
	```
	import {observer} from 'mobx-react';
	```

* Decorate the React component in that file with `@observer`:

	@observer
	class AppUi extends React.Component<AppProps, AppState> {
		...
	}

These changes achieve the goal of notifying the React component whenever a MobX observable is changed --- which in our strategy is whenever a signal is emitted.
