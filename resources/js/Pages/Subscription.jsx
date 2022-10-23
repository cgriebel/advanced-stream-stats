import React, { useEffect, useState } from "react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head } from "@inertiajs/inertia-react";
import axios from "axios";
import dropin from "braintree-web-drop-in";
import classnames from "classnames";

export default function Subscription(props) {
    const [braintreeInstance, setBraintreeInstance] = useState(undefined);
    const [clientToken, setClientToken] = useState(undefined);
    const [show, setShow] = useState(undefined);
    const [plans, setPlans] = useState([]);
    const [selectedPlan, setSelectedPlan] = useState(undefined);

    const onPaymentCompleted = (nonce) => {
        axios
            .post(`/subscription`, {
                payment_nonce: nonce,
                plan_id: selectedPlan,
            })
            .then((r) => {
                console.log(r);
            })
            .catch((e) => console.log(e));
    };

    useEffect(() => {
        axios
            .get("/subscription/load")
            .then((r) => {
                console.log(r);
                setClientToken(r.data.token);
                setShow(true);
                setPlans(r.data.plans);
            })
            .catch((e) => console.log(e));
    }, []);

    useEffect(() => {
        if (show) {
            const initializeBraintree = () =>
                dropin.create(
                    {
                        // insert your tokenization key or client token here
                        authorization: clientToken,
                        container: "#braintree-drop-in-div",
                        paypal: {
                            flow: "vault",
                        },
                    },
                    function (error, instance) {
                        if (error) console.error(error);
                        else setBraintreeInstance(instance);
                    }
                );

            if (braintreeInstance) {
                braintreeInstance.teardown().then(() => {
                    initializeBraintree();
                });
            } else {
                initializeBraintree();
            }
        }
    }, [show]);

    return (
        <AuthenticatedLayout
            auth={props.auth}
            errors={props.errors}
            header={
                <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                    Subscription
                </h2>
            }
        >
            <Head title="Subscription" />
            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 bg-white border-b border-gray-200">
                            <div class="container w-max mx-auto flex gap-4">
                                {plans?.map((p) => {
                                    console.log(p);
                                    return (
                                        <div>
                                            <div class="max-w-sm rounded overflow-hidden shadow-lg">
                                                <div class="px-6 py-4">
                                                    <div class="font-bold text-xl mb-2">
                                                        {p.name}
                                                    </div>
                                                    <p class="text-gray-700 text-base">
                                                        Price: ${p.price}
                                                    </p>
                                                    <div className="container mx-auto w-max mt-4">
                                                        <button
                                                            class={classnames(
                                                                "bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full",
                                                                p.id ==
                                                                    selectedPlan &&
                                                                    "bg-green-500"
                                                            )}
                                                            onClick={() => {
                                                                setSelectedPlan(
                                                                    p.id
                                                                );
                                                            }}
                                                        >
                                                            Select
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                            <div
                                className={classnames(
                                    "mt-4 max-w-sm mx-auto",
                                    !selectedPlan && "invisible"
                                )}
                            >
                                <div id={"braintree-drop-in-div"} />
                            </div>
                            {selectedPlan && (
                                <div className="container mx-auto w-max">
                                    <button
                                        className={
                                            "bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full"
                                        }
                                        type="primary"
                                        disabled={!braintreeInstance}
                                        onClick={() => {
                                            if (braintreeInstance) {
                                                braintreeInstance.requestPaymentMethod(
                                                    (error, payload) => {
                                                        if (error) {
                                                            console.error(
                                                                error
                                                            );
                                                        } else {
                                                            const paymentMethodNonce =
                                                                payload.nonce;
                                                            console.log(
                                                                "payment method nonce",
                                                                payload.nonce
                                                            );

                                                            // TODO: use the paymentMethodNonce to
                                                            //  call you server and complete the payment here

                                                            // ...

                                                            console.log(
                                                                `Payment completed with nonce=${paymentMethodNonce}`
                                                            );
                                                            onPaymentCompleted(
                                                                paymentMethodNonce
                                                            );
                                                        }
                                                    }
                                                );
                                            }
                                        }}
                                    >
                                        {"Subscribe"}
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            <div className="py-12"></div>
        </AuthenticatedLayout>
    );
}
