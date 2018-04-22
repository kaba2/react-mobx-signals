React, MobX and signals and slots
=================================

This is an example Typescript project demonstrating how to combine `React`, `MobX` and `typed-signals` (signals and slots) libraries to enable object-oriented state management combined with a reactive user interface.

TL;DR
-----

Objects in a traditional object-oriented design communicate automatically with each other by signals at valid and relevant states after state changes. Emitting a signal updates a `MobX`-observable stored in that signal, which in turn causes `React` to automatically update the user-interface.

What it does
------------

The example project is a program for drawing graphs, consisting of vertices and edges. The program has two tools: the drawing tool and the selection tool. The first allows to add edges to the graph, while the latter allows to select a subset of vertices and edges and remove that selection-set. The program provides reactive views to the graph data, showing the set of the vertices and edges in the graph and in the selection. The program demonstrates that

* The user-interface reacts automatically to changes in state represented by a traditional object-oriented design.
* The objects communicate with each other automatically after state-changes, so that for example when an edge is removed from the graph, it is also removed from the selection.
* Achieving this does not require much more than specifying useful signals for the objects, and then connecting those signals in a useful manner; there is minimal boilerplate.

Installation
------------

* Download the files as a ZIP.
* Extract to a folder, and in that folder type

	```
	npm install
	```

* To run the program, type

	```
	npm start
	```

Communication between objects
-----------------------------

An object must be able to control _when_ its state-changes are communicated outside, because only the object knows when its invariants are satisfied, or when a state-change is relevant. An object is in _valid state_ whenever its invariants are satisfied, and in _invalid state_ otherwise. Every time a member function of a (correctly-implemented) object is called, an object starts from a valid state, incrementally modifies its state, perhaps passing through invalid states, and finally ends up back to another valid state --- as specified by the member function's contract. The invalid states in the middle must remain hidden from outside observers, as must valid but irrelevant states. An object specifies valid program-locations at which it notifies interested observers about its state-changes. These program-locations are specified by emitting a signal. 

### Signals and slots

A _slot_ is a function reference. A _connection_ is an object which stores one slot. The _signature_ of the connection is the function-signature of its slot. A _signal_ is an object which stores a set of connections with the same signature. To _connect_ a signal `A` to a slot `B` means to store a new `B`-connection to `A`. To say that a signal is _emitted_ means to call its connections one by one. 

An object communicates its state-changes through its signals which are connected to other objects's member slots. The type of the state-change of is encoded by the memory-address of the emitting signal-object, and the details of that state-change are encoded in the function-arguments when calling each slot. For example, a collection of elements could emit a signal called `elementAdded(element)` after adding an element into the collection, where the added element is provided as an argument. The signals and slots form the interface by which objects of arbitrary type communicate with each other at well-defined instants; there is no coupling between types.

```typescript
class Selection {
	private _vertices = new Set<Vertex>();
	public readonly vertexAdded = new Signal<(vertex: Vertex) => void>();
	...
	public add(vertex: Vertex) {
		this._vertices.add(vertex);
		this.vertexAdded.emit(vertex);
	}
	...
}
```

Who creates the connections? The most typical situation is that each object `A` has a parent object `B` which creates and owns `A`. The parent object `B` connects `A`'s signals to other objects' slots upon creation; and often it is either to `B`'s own private slot or to a slot of `B`'s another child-object. The connections usually remain static through the lifetime of the object `A`, and are disconnected only when `A` is removed from the parent `B`. This typical situation answers the question of how signals and slots can possibly work in a language without deterministic object-destructors, where there is no way to disconnect an object when it is "destructed": the parent connects and disconnects its children. 

```typescript
class Project {
	private _selection = new Selection();
	public readonly meshAdded = new Signal<(mesh: Mesh) => void>();
	private _meshes = new Set<Mesh>();
	...
	public addMesh(): Mesh {
		const mesh = new Mesh();
		mesh.vertexToBeRemoved.connect(this.onVertexToBeRemoved);
		this._meshes.add(mesh);
		this.meshAdded.emit(mesh);
		return mesh;
	}
	...
	private onVertexToBeRemoved = (vertex: Vertex) => {
		this._selection.remove(vertex);
	}
}
``` 

Sometimes there is a need to temporarily _disable_ a connection. This is supported by signal and slots libraries directly; it does not require disconnecting the connection. Each connection can be given a _priority_, which decides the calling order when the signal is emitted.

Aggregation is a useful technique with signals and slots. Each slot in a connection can _return_ a value. An _aggregator_ object attaches to a signal, and observes, combines, and perhaps stores the connection-values, which it can then return as the result of the signal emittance process. The aggregate return type can differ from the slot return type. The aggregator can also stop the emitting process based on its observed values. For example, a signal could be asking each object behind a slot to perform a given task. Once an object agrees to carry out that task, the emitting process is stopped.

### Implementation

Implementing the signals and slots mechanism is simple. For example, the source code for typed-signals library takes about 360 lines with comments and some additional bells and whistles. Modifying this library or rolling your own should be in reach for any project.

Connecting `typed-signals` with `MobX`
--------------------------------------

The `typed-signals` library is an implementation of signals and slots for Typescript. `typed-signals` can be combined with the `MobX` library by specifying that each emit of a signal also updates a `MobX` observable stored in the signal. In this demonstration we have modified the `typed-signals` library (which we store locally rather than as a dependency) in the following minimal way.

* Add a new import in `Signal.ts`:

	```typescript
	import {observable} from 'mobx';
	```

* Add a new `Signal` class member:

	```typescript
	@observable public mobx = {};
	```

* Add a new assignment at the end of `Signal.emitInternal()`:

	```typescript
    this.mobx = {}
	```

These changes achieve the goal of notifying `MobX` whenever a signal is emitted. Ideally, we would never see `MobX` observables again in our code; signals are the interface for state-change-communication between objects at valid and relevant states.

`React`
-------

`React` is a library which aims at optimal updates of the domain object-model (DOM) tree in a browser. A `React` component corresponds to a node in the DOM tree. Its sole purpose is to rewrite its DOM sub-tree by the component's `render()` method whenever changes to its local state have been detected.

```typescript
import * as React from 'react';

interface MeshProps {
	firstName: string;
	lastName: string;
}

@observer
class Greeting extends React.Component<MeshProps, {}> {
	public render() {
		return (
		<div>
			<p>Hello, {this.props.firstName} {this.props.lastName}!</p>
		</div>
		);
	}
}
```

A `React` component has two kinds of data. First, _props_ are used to parametrize a component. They are passed to the component from its parent component. In the above example, the 'props' specify the name of the person to greet; the same component can be used to greet any person. Second, _state_ is data that is local to the component. A component uses local state to remember user input. In the above example the component has no local state, which is the most common situation. The local state is often passed, perhaps modified, to the child components as `props`. Since the local state can only be passed downwards in the DOM tree, it only affects the child nodes.

How does the `React` component know when its local state has changed? This is achieved by the convention that the local state must always be changed through the `setState` member function of the component. Because of this convention, `React` can check which `props` were modified by the change to the local state, and optimally rerender only those DOM child-nodes which are affected by the change. The `props` are never modified, because they must remain valid for the sibling components. 

`MobX`
------

`React` provides a fast way to render the DOM-tree, and update it with response to local state changes in its components. This leaves open the question of how to connect `React` with the rest of the application which consists of the application logic together with application-specific algorithms and data structures. `MobX` provides one piece of the solution for this.

### Connecting `MobX` with `React`

The `MobX` library is connected with `React` in the following minimal way:

* Add a new import to a `React` component file:
	
	```typescript
	import {observer} from 'mobx-react';
	```

* Decorate the `React` component in that file with `@observer`:

	```typescript
	@observer
	class AppUi extends React.Component<AppProps, AppState> {
		...
	}
	```

These changes achieve the goal of notifying the `React` component whenever a `MobX` observable is changed --- which in our case is whenever a signal is emitted.
