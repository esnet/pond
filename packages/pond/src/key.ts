/*
 *  Copyright (c) 2017, The Regents of the University of California,
 *  through Lawrence Berkeley National Laboratory (subject to receipt
 *  of any required approvals from the U.S. Dept. of Energy).
 *  All rights reserved.
 *
 *  This source code is licensed under the BSD-style license found in the
 *  LICENSE file in the root directory of this source tree.
 */

/**
 * Defines the interface for all event keys
 */
export abstract class Key {
    public abstract type(): string;
    public abstract toJSON(): {};
    public abstract toString(): string;
    public abstract timestamp(): Date;
    public abstract begin(): Date;
    public abstract end(): Date;
}
