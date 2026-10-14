import {
    FiArrowRight,
    FiCheckCircle,
} from "react-icons/fi";

export default function PipelineWidget({

    title = "Audit Workflow",

    stages = [],

}) {

    return (

        <div className="rounded-2xl border border-gray-700 bg-[#111827]/80 backdrop-blur-lg">

            <div className="border-b border-gray-700 px-6 py-5">

                <h2 className="text-lg font-semibold">

                    {title}

                </h2>

            </div>

            <div className="overflow-x-auto">

                <div className="flex items-center gap-4 px-6 py-8 min-w-max">

                    {

                        stages.map((stage,index)=>(

                            <>

                                <div
                                    key={stage.id}
                                    className="flex flex-col items-center min-w-32.5"
                                >

                                    <div
                                        className="w-16 h-16 rounded-full bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center"
                                    >

                                        <span className="text-2xl font-bold">

                                            {stage.value}

                                        </span>

                                    </div>

                                    <p className="mt-4 text-sm text-gray-400 text-center">

                                        {stage.title}

                                    </p>

                                </div>

                                {

                                    index!==stages.length-1 && (

                                        <FiArrowRight
                                            className="text-gray-600 text-2xl"
                                        />

                                    )

                                }

                            </>

                        ))

                    }

                </div>

            </div>

        </div>

    );

}