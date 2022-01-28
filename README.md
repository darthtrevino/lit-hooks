# lit-hooks

Basic implementation of some React hook patterns for Lit WebComponents

## Note: Experimental Phase

The mental model provided by React hooks provide a refined developer experience, and in the case of `useEffect`, they can dramatically simplify the tasks of resource allocation and disposal. 

In my own experiments with Lit I found that these resource-oriented tasks were somewhat cumbersome in comparison with React Hooks, and so I began experimenting with the ReactiveController API to make a facsimile of React hooks that would improve my own DX.

Currently, this repository contains Lit-variant of useEffect, although it is somewhat limited in comparison to its React counterpart.
