
import {
    FiArrowRight,
} from "react-icons/fi";

export default function PipelineWidget({

    title = "Audit Workflow",

    stages = [],

}) {

    return (

        <div className="rounded-2xl border theme-border theme-bg-card shadow-sm">

            <div className="border-b theme-border px-6 py-5">

                <h2 className="text-lg font-semibold theme-text-primary">

                    {title}

                </h2>

            </div>

            <div className="overflow-x-auto">

                <div className="flex items-center gap-4 px-6 py-8 min-w-max">

                    {

                        stages.map((stage, index) => (

                            <React.Fragment key={stage.id || index}>

                                <div
                                    className="flex flex-col items-center min-w-32.5"
                                >

                                    <div
                                        className="w-16 h-16 rounded-full theme-bg-primary-soft border theme-border flex items-center justify-center"
                                    >

                                        <span className="text-2xl font-bold theme-text-primary-color">

                                            {stage.value}

                                        </span>

                                    </div>

                                    <p className="mt-4 text-sm theme-text-secondary text-center">

                                        {stage.title}

                                    </p>

                                </div>

                                {

                                    index !== stages.length - 1 && (

                                        <FiArrowRight
                                            className="theme-text-muted text-2xl"
                                        />

                                    )

                                }

                            </React.Fragment>

                        ))

                    }

                </div>

            </div>

        </div>

    );

}
